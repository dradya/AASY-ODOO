import unittest
from unittest.mock import patch

from app import app, validate_document, next_status


class BusinessRulesTest(unittest.TestCase):
    def test_receipt_rejects_missing_items(self):
        with self.assertRaisesRegex(ValueError, 'item'):
            validate_document('receipts', {'vendor_name': 'Vendor', 'warehouse_id': 'w', 'location_id': 'l', 'items': []})

    def test_delivery_rejects_negative_quantity(self):
        with self.assertRaisesRegex(ValueError, 'positive'):
            validate_document('deliveries', {'customer_name': 'Customer', 'warehouse_id': 'w', 'location_id': 'l', 'items': [{'product_id': 'p', 'requested_quantity': 2, 'delivered_quantity': -1}]})

    def test_duplicate_item_rejected(self):
        with self.assertRaisesRegex(ValueError, 'Duplicate'):
            validate_document('receipts', {'vendor_name': 'V', 'warehouse_id': 'w', 'location_id': 'l', 'items': [{'product_id': 'p', 'expected_quantity': 1, 'received_quantity': 1}, {'product_id': 'p', 'expected_quantity': 2, 'received_quantity': 2}]})

    def test_only_forward_transitions(self):
        self.assertEqual(next_status('draft', 'waiting'), 'waiting')
        self.assertEqual(next_status('waiting', 'ready'), 'ready')
        with self.assertRaises(ValueError):
            next_status('done', 'ready')

    def test_health_and_auth_boundary(self):
        client = app.test_client()
        self.assertEqual(client.get('/api/health').status_code, 200)
        response = client.get('/api/products')
        self.assertEqual(response.status_code, 401)
        self.assertIn('Login required', response.json['error'])

    def test_staff_cannot_apply_adjustment(self):
        def fake(path, *args, **kwargs):
            if path == '/auth/v1/user':
                return {'id': 'u1'}
            if path == '/rest/v1/profiles':
                return [{'id': 'u1', 'role': 'staff'}]
            raise AssertionError(f'Unexpected database call: {path}')
        with patch('app.supabase', side_effect=fake):
            response = app.test_client().post('/api/adjustments/x/validate', headers={'Authorization': 'Bearer token'})
        self.assertEqual(response.status_code, 403)

    def test_receipt_validation_calls_atomic_rpc(self):
        calls = []
        def fake(path, *args, **kwargs):
            calls.append(path)
            if path == '/auth/v1/user':
                return {'id': 'u1'}
            if path == '/rest/v1/profiles':
                return [{'id': 'u1', 'role': 'staff'}]
            if path == '/rest/v1/rpc/complete_receipt':
                self.assertEqual(args[1], {'p_id': 'receipt-id'})
                return None
            if path == '/rest/v1/receipts':
                return [{'id': 'receipt-id', 'status': 'done'}]
            raise AssertionError(path)
        with patch('app.supabase', side_effect=fake):
            response = app.test_client().post('/api/receipts/receipt-id/validate', headers={'Authorization': 'Bearer token'})
        self.assertEqual(response.status_code, 200)
        self.assertIn('/rest/v1/rpc/complete_receipt', calls)


if __name__ == '__main__':
    unittest.main()
