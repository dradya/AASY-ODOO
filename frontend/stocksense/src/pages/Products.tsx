import React, { useState, useMemo } from 'react';
import { z } from 'zod';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Plus, Search, Eye, Pencil, Trash2, MoreHorizontal, Filter, AlertTriangle, Package } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Product } from '../types/inventory';
import { mockProducts, categories, warehouses, statuses } from '../data/mockData';
import StatusBadge from '../components/StatusBadge';

// Units of measure
const units = ['Pieces', 'Meters', 'Reams', 'Kilograms', 'Liters'];

// Zod schema for product validation
const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  sku: z.string().min(2, 'SKU must be at least 2 characters'),
  category: z.string().min(1, 'Category is required'),
  unitOfMeasure: z.string().min(1, 'Unit of Measure is required'),
  stockQuantity: z.coerce.number().min(0, 'Stock must be non-negative'),
  reorderLevel: z.coerce.number().min(0, 'Reorder level must be non-negative'),
  warehouse: z.string().min(1, 'Warehouse is required'),
  location: z.string().min(1, 'Location is required'),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function Products() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Dialog states
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    sku: '',
    category: '',
    unitOfMeasure: '',
    stockQuantity: 0,
    reorderLevel: 0,
    warehouse: '',
    location: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      const matchesWarehouse = warehouseFilter === 'all' || p.warehouse === warehouseFilter;
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

      return matchesSearch && matchesCategory && matchesWarehouse && matchesStatus;
    });
  }, [products, searchQuery, categoryFilter, warehouseFilter, statusFilter]);

  const handleOpenAdd = () => {
    setCurrentProduct(null);
    setFormData({
      name: '',
      sku: '',
      category: '',
      unitOfMeasure: '',
      stockQuantity: 0,
      reorderLevel: 0,
      warehouse: '',
      location: '',
    });
    setFormErrors({});
    setIsAddEditDialogOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      unitOfMeasure: product.unitOfMeasure,
      stockQuantity: product.stockQuantity,
      reorderLevel: product.reorderLevel,
      warehouse: product.warehouse,
      location: product.location,
    });
    setFormErrors({});
    setIsAddEditDialogOpen(true);
  };

  const handleOpenView = (product: Product) => {
    setCurrentProduct(product);
    setIsViewDialogOpen(true);
  };

  const handleOpenDelete = (product: Product) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when typing
    if (formErrors[name as keyof ProductFormData]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof ProductFormData]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = productSchema.safeParse(formData);

    if (!result.success) {
      const errors: Partial<Record<keyof ProductFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as keyof ProductFormData;
        errors[path] = issue.message;
      });
      setFormErrors(errors);
      return;
    }

    // Determine status based on stock and reorder level
    let status: Product['status'] = 'in-stock';
    if (result.data.stockQuantity === 0) {
      status = 'out-of-stock';
    } else if (result.data.stockQuantity <= result.data.reorderLevel) {
      status = 'low-stock';
    }

    const now = new Date().toISOString();

    if (currentProduct) {
      // Edit
      setProducts((prev) =>
        prev.map((p) =>
          p.id === currentProduct.id
            ? {
                ...p,
                ...result.data,
                status,
                updatedAt: now,
              }
            : p
        )
      );
    } else {
      // Add
      const newProduct: Product = {
        id: `PROD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        ...result.data,
        status,
        createdAt: now,
        updatedAt: now,
      };
      setProducts((prev) => [newProduct, ...prev]);
    }
    setIsAddEditDialogOpen(false);
  };

  const handleDelete = () => {
    if (currentProduct) {
      setProducts((prev) => prev.filter((p) => p.id !== currentProduct.id));
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">Products</h1>
            <Badge variant="secondary" className="px-2.5 py-0.5 rounded-full font-medium">
              {filteredProducts.length} Total
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">Manage and track your product inventory comprehensively</p>
        </div>
        <Button onClick={handleOpenAdd} className="shadow-sm transition-all hover:shadow-md bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card/60 backdrop-blur-xl p-5 rounded-2xl border border-border/50 shadow-sm">
        <div className="relative w-full sm:max-w-md transition-all group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
          <Input
            placeholder="Search by name, SKU, or category..."
            className="pl-10 w-full rounded-xl bg-background/50 border-border/50 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto ml-auto">
          <div className="hidden sm:flex items-center justify-center bg-muted/50 p-2 rounded-lg border border-border/50">
            <Filter className="h-4 w-4 text-muted-foreground" />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px] rounded-xl bg-background/50 border-border/50 focus:ring-indigo-500/30">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
            <SelectTrigger className="w-[140px] rounded-xl bg-background/50 border-border/50 focus:ring-indigo-500/30">
              <SelectValue placeholder="Warehouse" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Warehouses</SelectItem>
              {warehouses.map((w) => (
                <SelectItem key={w} value={w}>{w}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] rounded-xl bg-background/50 border-border/50 focus:ring-indigo-500/30">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border border-border/50 rounded-2xl bg-card shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-b-border/50">
                <TableHead className="w-[200px] py-4">Product Name</TableHead>
                <TableHead className="py-4">SKU</TableHead>
                <TableHead className="py-4">Category</TableHead>
                <TableHead className="py-4">Unit</TableHead>
                <TableHead className="text-right py-4">Stock Qty</TableHead>
                <TableHead className="py-4">Warehouse</TableHead>
                <TableHead className="py-4">Location</TableHead>
                <TableHead className="text-right py-4">Reorder Level</TableHead>
                <TableHead className="py-4">Status</TableHead>
                <TableHead className="w-[60px] py-4"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Package className="h-8 w-8 opacity-20" />
                      <p>No products found matching your filters.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-muted/40 transition-colors group">
                    <TableCell className="font-semibold text-foreground py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                          <Package className="h-4 w-4" />
                        </div>
                        <span className="truncate">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm font-medium">{product.sku}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-background/50 font-normal">
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{product.unitOfMeasure}</TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-semibold',
                        product.stockQuantity <= product.reorderLevel ? 'text-rose-600' : 'text-emerald-600'
                      )}
                    >
                      {product.stockQuantity}
                    </TableCell>
                    <TableCell className="text-sm">{product.warehouse}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{product.location}</TableCell>
                    <TableCell className="text-right text-muted-foreground font-medium">{product.reorderLevel}</TableCell>
                    <TableCell>
                      <StatusBadge status={product.status} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 data-[state=open]:opacity-100">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl w-40">
                          <DropdownMenuLabel className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleOpenView(product)} className="rounded-lg cursor-pointer my-1">
                            <Eye className="mr-2 h-4 w-4 text-indigo-500" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenEdit(product)} className="rounded-lg cursor-pointer my-1">
                            <Pencil className="mr-2 h-4 w-4 text-amber-500" />
                            Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleOpenDelete(product)}
                            className="text-rose-600 focus:text-rose-600 focus:bg-rose-50 rounded-lg cursor-pointer my-1"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add/Edit Product Dialog */}
      <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
        <DialogContent className="sm:max-w-[650px] overflow-y-auto max-h-[90vh] rounded-2xl p-0 gap-0 border-0 shadow-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="p-6 pb-4 border-b border-border/50 bg-muted/10">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                    {currentProduct ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  </div>
                  {currentProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
                <DialogDescription className="pt-2 text-base">
                  {currentProduct
                    ? 'Update the details of the product below. Changes are saved immediately.'
                    : 'Fill in the details to add a new product to your inventory system.'}
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <div className="p-6 grid gap-6">
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="rounded-xl bg-muted/30 border-transparent focus:bg-background focus:border-indigo-500 transition-colors"
                    placeholder="e.g. Ergonomic Chair"
                  />
                  {formErrors.name && (
                    <span className="text-xs font-medium text-rose-500 flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-3 w-3" /> {formErrors.name}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">SKU / Code</Label>
                  <Input
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleFormChange}
                    className="rounded-xl bg-muted/30 border-transparent focus:bg-background focus:border-indigo-500 transition-colors"
                    placeholder="e.g. FUR-CH-001"
                  />
                  {formErrors.sku && (
                    <span className="text-xs font-medium text-rose-500 flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-3 w-3" /> {formErrors.sku}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(val) => handleSelectChange('category', val)}
                  >
                    <SelectTrigger className="rounded-xl bg-muted/30 border-transparent focus:bg-background focus:border-indigo-500 transition-colors">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.category && (
                    <span className="text-xs font-medium text-rose-500 flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-3 w-3" /> {formErrors.category}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitOfMeasure" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Unit of Measure</Label>
                  <Select
                    value={formData.unitOfMeasure}
                    onValueChange={(val) => handleSelectChange('unitOfMeasure', val)}
                  >
                    <SelectTrigger className="rounded-xl bg-muted/30 border-transparent focus:bg-background focus:border-indigo-500 transition-colors">
                      <SelectValue placeholder="Select Unit" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {units.map((u) => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.unitOfMeasure && (
                    <span className="text-xs font-medium text-rose-500 flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-3 w-3" /> {formErrors.unitOfMeasure}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 dark:border-indigo-900/30 dark:bg-indigo-900/10">
                <div className="space-y-2">
                  <Label htmlFor="stockQuantity" className="text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">Initial Stock Quantity</Label>
                  <Input
                    id="stockQuantity"
                    name="stockQuantity"
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={handleFormChange}
                    className="rounded-xl bg-background border-indigo-200/50 dark:border-indigo-800/50 focus:border-indigo-500 font-medium"
                  />
                  {formErrors.stockQuantity && (
                    <span className="text-xs font-medium text-rose-500 flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-3 w-3" /> {formErrors.stockQuantity}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reorderLevel" className="text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">Reorder Level Alert</Label>
                  <Input
                    id="reorderLevel"
                    name="reorderLevel"
                    type="number"
                    min="0"
                    value={formData.reorderLevel}
                    onChange={handleFormChange}
                    className="rounded-xl bg-background border-indigo-200/50 dark:border-indigo-800/50 focus:border-indigo-500 font-medium"
                  />
                  {formErrors.reorderLevel && (
                    <span className="text-xs font-medium text-rose-500 flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-3 w-3" /> {formErrors.reorderLevel}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="warehouse" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Warehouse</Label>
                  <Select
                    value={formData.warehouse}
                    onValueChange={(val) => handleSelectChange('warehouse', val)}
                  >
                    <SelectTrigger className="rounded-xl bg-muted/30 border-transparent focus:bg-background focus:border-indigo-500 transition-colors">
                      <SelectValue placeholder="Select Warehouse" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {warehouses.map((w) => (
                        <SelectItem key={w} value={w}>{w}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.warehouse && (
                    <span className="text-xs font-medium text-rose-500 flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-3 w-3" /> {formErrors.warehouse}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Storage Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleFormChange}
                    className="rounded-xl bg-muted/30 border-transparent focus:bg-background focus:border-indigo-500 transition-colors"
                    placeholder="e.g. Aisle 3, Shelf B"
                  />
                  {formErrors.location && (
                    <span className="text-xs font-medium text-rose-500 flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-3 w-3" /> {formErrors.location}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border/50 bg-muted/10 mt-auto">
              <DialogFooter className="gap-3 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setIsAddEditDialogOpen(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                  {currentProduct ? 'Save Changes' : 'Add Product'}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Product Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[550px] p-0 rounded-2xl overflow-hidden border-0 shadow-2xl">
          {currentProduct && (
            <div className="flex flex-col h-full bg-card">
              <div className="px-8 py-6 bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-950/20 dark:to-card border-b border-border/50">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{currentProduct.sku}</p>
                    <h3 className="text-2xl font-bold font-heading text-foreground">{currentProduct.name}</h3>
                  </div>
                  <StatusBadge status={currentProduct.status} />
                </div>
                <Badge variant="outline" className="bg-white dark:bg-background">{currentProduct.category}</Badge>
              </div>

              <div className="p-8 grid sm:grid-cols-2 gap-x-8 gap-y-8 text-sm">
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Unit of Measure</span>
                  <p className="font-medium text-base text-foreground bg-muted/30 px-3 py-2 rounded-lg border border-transparent">{currentProduct.unitOfMeasure}</p>
                </div>
                
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last Updated</span>
                  <p className="font-medium text-base text-foreground bg-muted/30 px-3 py-2 rounded-lg border border-transparent">
                    {new Date(currentProduct.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Warehouse</span>
                  <p className="font-medium text-base text-foreground bg-muted/30 px-3 py-2 rounded-lg border border-transparent">{currentProduct.warehouse}</p>
                </div>
                
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Location</span>
                  <p className="font-medium text-base text-foreground bg-muted/30 px-3 py-2 rounded-lg border border-transparent">{currentProduct.location}</p>
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-4 mt-2 p-5 bg-muted/30 rounded-xl border border-border/50">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Stock</span>
                    <p className={cn(
                        'text-3xl font-bold font-heading',
                        currentProduct.stockQuantity <= currentProduct.reorderLevel ? 'text-rose-600' : 'text-emerald-600'
                      )}>
                      {currentProduct.stockQuantity}
                    </p>
                  </div>
                  <div className="space-y-1 pl-4 border-l border-border/50">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reorder Level</span>
                    <p className="text-3xl font-bold font-heading text-foreground opacity-80">{currentProduct.reorderLevel}</p>
                  </div>
                </div>
              </div>

              <div className="px-8 py-5 border-t border-border/50 bg-muted/10 mt-auto flex justify-end">
                <Button onClick={() => setIsViewDialogOpen(false)} className="rounded-xl px-6">Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-[425px] rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
          <div className="p-6 text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-rose-100 dark:bg-rose-900/20 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-rose-600 dark:text-rose-500" />
            </div>
            <AlertDialogHeader className="text-center">
              <AlertDialogTitle className="text-2xl font-bold text-center w-full">Delete Product?</AlertDialogTitle>
              <AlertDialogDescription className="text-center pt-2">
                This will permanently delete <span className="font-semibold text-foreground">"{currentProduct?.name}"</span> and remove all of its data from our servers. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <div className="p-4 bg-muted/20 border-t border-border/50 flex flex-col-reverse sm:flex-row justify-end gap-2">
            <AlertDialogCancel className="rounded-xl sm:mt-0">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm">
              Delete Product
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
