import os
from decimal import Decimal, InvalidOperation
from functools import wraps

import requests
from dotenv import load_dotenv
from flask import Flask, g, jsonify, request
from flask_cors import CORS

load_dotenv()
app = Flask(__name__)
CORS(app, origins=[os.getenv('FRONTEND_ORIGIN', 'http://localhost:5173')])

TABLES = {'products', 'categories', 'warehouses', 'locations', 'inventory',
          'receipts', 'deliveries', 'transfers', 'adjustments', 'stock_movements'}
DOCUMENTS = {
    'receipts': ('receipt_items', 'receipt_id', 'complete_receipt'),
    'deliveries': ('delivery_items', 'delivery_id', 'complete_delivery'),
    'transfers': ('transfer_items', 'transfer_id', 'complete_transfer'),
}
FIELDS = {
    'products': {'name', 'sku', 'category_id', 'unit', 'unit_cost', 'sales_price', 'reorder_level', 'description', 'is_active'},
    'categories': {'name', 'description'},
    'warehouses': {'name', 'short_code', 'address'},
    'locations': {'warehouse_id', 'name', 'short_code'},
    'receipts': {'reference', 'vendor_name', 'warehouse_id', 'location_id', 'scheduled_date', 'source_document'},
    'deliveries': {'reference', 'customer_name', 'warehouse_id', 'location_id', 'scheduled_date', 'source_document'},
    'transfers': {'reference', 'source_warehouse_id', 'source_location_id', 'destination_warehouse_id', 'destination_location_id', 'scheduled_date', 'notes'},
    'adjustments': {'reference', 'warehouse_id', 'location_id', 'product_id', 'counted_quantity', 'reason', 'notes'},
}
ITEM_FIELDS = {
    'receipts': {'product_id', 'expected_quantity', 'received_quantity'},
    'deliveries': {'product_id', 'requested_quantity', 'delivered_quantity'},
    'transfers': {'product_id', 'quantity'},
}
FILTERS = {
    'products': {'name', 'sku', 'category_id', 'is_active'},
    'warehouses': {'name', 'short_code'}, 'locations': {'name', 'warehouse_id'},
    'inventory': {'product_id', 'warehouse_id', 'location_id'},
    'receipts': {'reference', 'status', 'vendor_name', 'warehouse_id', 'scheduled_date'},
    'deliveries': {'reference', 'status', 'customer_name', 'warehouse_id', 'scheduled_date'},
    'transfers': {'reference', 'status', 'source_warehouse_id'},
    'adjustments': {'reference', 'status', 'warehouse_id', 'location_id'},
    'stock_movements': {'reference', 'movement_type', 'product_id', 'status'},
    'categories': {'name'},
}


class APIError(Exception):
    def __init__(self, message, status=400):
        self.message, self.status = str(message), status


@app.errorhandler(APIError)
def api_error(error):
    return jsonify(error=error.message), error.status


def settings():
    base = os.getenv('SUPABASE_URL', '').rstrip('/')
    service = os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')
    anon = os.getenv('SUPABASE_ANON_KEY', '')
    if not all((base, service, anon)) or 'YOUR_PROJECT' in base:
        raise APIError('Supabase is not configured. See backend/.env.example.', 503)
    return base, service, anon


def supabase(path, method='GET', payload=None, params=None, use_anon=False, token=None):
    base, service, anon = settings()
    key = anon if use_anon else service
    headers = {'apikey': key, 'Authorization': f'Bearer {token or key}',
               'Content-Type': 'application/json', 'Prefer': 'return=representation'}
    try:
        response = requests.request(method, base + path, headers=headers,
                                    json=payload, params=params, timeout=15)
    except requests.RequestException:
        raise APIError('Database connection unavailable', 503)
    if response.status_code >= 400:
        detail = response.json() if response.content else {}
        message = detail.get('message') or detail.get('error_description') or detail.get('error') or 'Database request failed'
        raise APIError(message, 400 if response.status_code >= 500 else response.status_code)
    return response.json() if response.content else None


def authorize(fn):
    @wraps(fn)
    def wrapped(*args, **kwargs):
        header = request.headers.get('Authorization', '')
        if not header.startswith('Bearer '):
            raise APIError('Login required', 401)
        token = header[7:]
        try:
            user = supabase('/auth/v1/user', use_anon=True, token=token)
            if not user or not user.get('id'):
                raise APIError('Invalid session', 401)
            profiles = supabase('/rest/v1/profiles', params={'id': f"eq.{user['id']}", 'select': '*', 'limit': '1'})
        except APIError as exc:
            if exc.status in (400, 401, 403):
                raise APIError('Invalid session', 401)
            raise
        if not profiles:
            raise APIError('Profile missing', 403)
        g.user, g.profile = user, profiles[0]
        return fn(*args, **kwargs)
    return wrapped


def manager():
    if g.profile['role'] != 'manager':
        raise APIError('Manager access required', 403)


def body():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        raise APIError('A JSON object is required')
    return data


def positive(value, label, allow_zero=False):
    try:
        number = Decimal(str(value))
    except (InvalidOperation, TypeError):
        raise ValueError(f'{label} must be a positive number')
    if not number.is_finite() or (number < 0 if allow_zero else number <= 0):
        raise ValueError(f'{label} must be a positive number')


def validate_document(kind, data):
    required = {'receipts': ['vendor_name', 'warehouse_id', 'location_id'],
                'deliveries': ['customer_name', 'warehouse_id', 'location_id'],
                'transfers': ['source_warehouse_id', 'source_location_id', 'destination_warehouse_id', 'destination_location_id']}
    for field in required[kind]:
        if not data.get(field):
            raise ValueError(f'{field.replace("_", " ")} is required')
    if kind == 'transfers' and data['source_location_id'] == data['destination_location_id']:
        raise ValueError('Source and destination must differ')
    items = data.get('items')
    if not isinstance(items, list) or not items:
        raise ValueError('At least one item is required')
    seen = set()
    for item in items:
        product = item.get('product_id') if isinstance(item, dict) else None
        if not product:
            raise ValueError('A product is required for each item')
        if product in seen:
            raise ValueError('Duplicate product in items')
        seen.add(product)
        for field in ITEM_FIELDS[kind] - {'product_id'}:
            positive(item.get(field), field)


def next_status(current, target):
    allowed = {'draft': {'waiting', 'canceled'}, 'waiting': {'ready', 'canceled'},
               'ready': {'canceled'}, 'done': set(), 'canceled': set()}
    if target not in allowed.get(current, set()):
        raise ValueError(f'Cannot change {current} to {target}')
    return target


def one(table, identifier):
    rows = supabase(f'/rest/v1/{table}', params={'id': f'eq.{identifier}', 'select': '*', 'limit': '1'})
    if not rows:
        raise APIError(f'{table[:-1].title()} not found', 404)
    return rows[0]


def validate_location(warehouse, location):
    row = one('locations', location)
    if row['warehouse_id'] != warehouse:
        raise APIError('Location does not belong to selected warehouse')


def validate_locations(kind, data):
    if kind == 'transfers':
        validate_location(data['source_warehouse_id'], data['source_location_id'])
        validate_location(data['destination_warehouse_id'], data['destination_location_id'])
    elif kind in ('receipts', 'deliveries', 'adjustments'):
        validate_location(data['warehouse_id'], data['location_id'])


@app.get('/api/health')
def health():
    return jsonify(status='ok', database='configured' if os.getenv('SUPABASE_URL') else 'unconfigured')


@app.get('/api/me')
@authorize
def me():
    return jsonify(g.profile)


@app.get('/api/dashboard')
@authorize
def dashboard():
    products = supabase('/rest/v1/products', params={'select': 'id,name,reorder_level,is_active'})
    inventory = supabase('/rest/v1/inventory', params={'select': 'product_id,warehouse_id,quantity_on_hand,quantity_reserved'})
    receipts = supabase('/rest/v1/receipts', params={'select': 'id,status,scheduled_date'})
    deliveries = supabase('/rest/v1/deliveries', params={'select': 'id,status,scheduled_date'})
    transfers = supabase('/rest/v1/transfers', params={'select': 'id,status'})
    warehouses = supabase('/rest/v1/warehouses', params={'select': 'id,name'})
    moves = supabase('/rest/v1/stock_movements', params={'select': '*', 'order': 'created_at.desc', 'limit': '6'})
    totals = {}
    for row in inventory:
        totals[row['product_id']] = totals.get(row['product_id'], 0) + float(row['quantity_on_hand'])
    active = [p for p in products if p['is_active']]
    low = [dict(p, quantity=totals.get(p['id'], 0)) for p in active if 0 < totals.get(p['id'], 0) <= float(p['reorder_level'])]
    out = [p for p in active if totals.get(p['id'], 0) <= 0]
    return jsonify(kpis={'products': len([p for p in active if totals.get(p['id'], 0) > 0]),
                         'low': len(low), 'out': len(out),
                         'pending_receipts': sum(r['status'] not in ('done','canceled') for r in receipts),
                         'pending_deliveries': sum(r['status'] not in ('done','canceled') for r in deliveries),
                         'transfers': sum(r['status'] not in ('done','canceled') for r in transfers)},
                   receipts=receipts, deliveries=deliveries, low_stock=low[:6],
                   warehouses=warehouses, movements=moves)


@app.get('/api/<table>')
@authorize
def list_rows(table):
    if table not in TABLES:
        raise APIError('Unknown resource', 404)
    try:
        page = max(1, min(10000, int(request.args.get('page', 1))))
        limit = max(1, min(100, int(request.args.get('limit', 25))))
    except ValueError:
        raise APIError('page and limit must be numbers')
    params = {'select': '*', 'limit': str(limit), 'offset': str((page-1)*limit)}
    if table in ('stock_movements', 'receipts', 'deliveries', 'transfers', 'adjustments'):
        params['order'] = 'created_at.desc'
    for key in FILTERS.get(table, set()):
        val = request.args.get(key)
        if val:
            params[key] = f'eq.{val}'
    search = request.args.get('search', '').strip().replace(',', '').replace('(', '').replace(')', '')
    if search:
        cols = {'products': ['name','sku'], 'warehouses': ['name','short_code'], 'locations': ['name','short_code'],
                'receipts': ['reference','vendor_name','source_document'], 'deliveries': ['reference','customer_name','source_document'],
                'transfers': ['reference'], 'adjustments': ['reference'], 'stock_movements': ['reference']}.get(table, [])
        if cols:
            params['or'] = '(' + ','.join(f'{col}.ilike.*{search}*' for col in cols) + ')'
    return jsonify(supabase(f'/rest/v1/{table}', params=params))


@app.get('/api/<table>/<identifier>')
@authorize
def get_row(table, identifier):
    if table not in TABLES:
        raise APIError('Unknown resource', 404)
    row = one(table, identifier)
    if table in DOCUMENTS:
        child, fk, _ = DOCUMENTS[table]
        row['items'] = supabase(f'/rest/v1/{child}', params={fk: f'eq.{identifier}', 'select': '*'})
    return jsonify(row)


@app.post('/api/<table>')
@authorize
def create_row(table):
    if table not in FIELDS:
        raise APIError('Unknown resource', 404)
    data = body()
    if table in ('warehouses', 'locations', 'products', 'categories', 'adjustments'):
        manager()
    if table in DOCUMENTS:
        try:
            validate_document(table, data)
        except ValueError as exc:
            raise APIError(exc)
        validate_locations(table, data)
        for item in data['items']:
            one('products', item['product_id'])
    if table == 'adjustments':
        for field in ('warehouse_id', 'location_id', 'product_id', 'reason', 'counted_quantity'):
            if not data.get(field) and data.get(field) != 0:
                raise APIError(f'{field} is required')
        positive(data['counted_quantity'], 'counted quantity', allow_zero=True)
        validate_locations(table, data)
        one('products', data['product_id'])
    if table == 'products':
        if not data.get('name') or not data.get('sku'):
            raise APIError('Name and SKU are required')
        for field in ('unit_cost', 'sales_price', 'reorder_level'):
            positive(data.get(field, 0), field, allow_zero=True)
    if table == 'locations' and data.get('warehouse_id'):
        one('warehouses', data['warehouse_id'])
    if table in ('warehouses','locations','categories') and not data.get('name'):
        raise APIError('Name is required')
    payload = {k: v for k, v in data.items() if k in FIELDS[table]}
    if table in DOCUMENTS or table == 'adjustments':
        payload['responsible_user'] = g.user['id']
        payload['reference'] = payload.get('reference') or f"{table[:3].upper()}-{os.urandom(3).hex().upper()}"
    if table in DOCUMENTS:
        payload['items'] = [{k: v for k, v in item.items() if k in ITEM_FIELDS[table]} for item in data['items']]
        identifier = supabase('/rest/v1/rpc/save_document', 'POST', {'p_kind': table, 'p_data': payload, 'p_id': None, 'p_user': g.user['id']})
        row = one(table, identifier)
    else:
        row = supabase(f'/rest/v1/{table}', 'POST', payload)[0]
    return jsonify(row), 201


@app.put('/api/<table>/<identifier>')
@authorize
def update_row(table, identifier):
    if table not in FIELDS:
        raise APIError('Unknown resource', 404)
    if table in ('products', 'categories', 'warehouses', 'locations', 'adjustments'):
        manager()
    current = one(table, identifier)
    if table in DOCUMENTS and current['status'] != 'draft':
        raise APIError('Only draft documents can be edited')
    if table == 'adjustments' and current['status'] != 'draft':
        raise APIError('Completed adjustments cannot be edited')
    data = body()
    payload = {k: v for k, v in data.items() if k in FIELDS[table] and k != 'reference'}
    if not payload and 'items' not in data:
        raise APIError('No editable fields supplied')
    if table in DOCUMENTS:
        child, fk, _ = DOCUMENTS[table]
        existing_items = supabase(f'/rest/v1/{child}', params={fk: f'eq.{identifier}', 'select': '*'})
        candidate = {**current, **data, 'items': data.get('items', existing_items)}
        try:
            validate_document(table, candidate)
        except ValueError as exc:
            raise APIError(exc)
        validate_locations(table, candidate)
        payload = {k: v for k, v in candidate.items() if k in FIELDS[table]}
        payload['items'] = [{k: v for k, v in item.items() if k in ITEM_FIELDS[table]} for item in candidate['items']]
        supabase('/rest/v1/rpc/save_document', 'POST', {'p_kind': table, 'p_data': payload, 'p_id': identifier, 'p_user': g.user['id']})
        return jsonify(one(table, identifier))
    if payload:
        current = supabase(f'/rest/v1/{table}', 'PATCH', payload, {'id': f'eq.{identifier}'})[0]
    return jsonify(current)


@app.delete('/api/<table>/<identifier>')
@authorize
def delete_row(table, identifier):
    manager()
    if table not in ('products', 'warehouses', 'locations', 'categories'):
        raise APIError('Resource cannot be deleted', 405)
    one(table, identifier)
    if table == 'products':
        supabase('/rest/v1/products', 'PATCH', {'is_active': False}, {'id': f'eq.{identifier}'})
    else:
        supabase(f'/rest/v1/{table}', 'DELETE', params={'id': f'eq.{identifier}'})
    return '', 204


@app.post('/api/<table>/<identifier>/status')
@authorize
def status_row(table, identifier):
    if table not in DOCUMENTS:
        raise APIError('Unknown operation', 404)
    current = one(table, identifier)
    target = body().get('status')
    try:
        next_status(current['status'], target)
    except ValueError as exc:
        raise APIError(exc)
    supabase('/rest/v1/rpc/advance_document', 'POST', {'p_kind': table, 'p_id': identifier, 'p_target': target})
    return jsonify(one(table, identifier))


@app.post('/api/<table>/<identifier>/validate')
@authorize
def validate_row(table, identifier):
    if table == 'adjustments':
        manager()
        rpc = 'complete_adjustment'
    elif table in DOCUMENTS:
        rpc = DOCUMENTS[table][2]
    else:
        raise APIError('Unknown operation', 404)
    supabase(f'/rest/v1/rpc/{rpc}', 'POST', {'p_id': identifier})
    return jsonify(one(table, identifier))


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=int(os.getenv('PORT', '5000')), debug=os.getenv('FLASK_DEBUG') == '1')
