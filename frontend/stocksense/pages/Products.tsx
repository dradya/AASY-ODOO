import React, { useState, useMemo } from 'react';
import { z } from 'zod';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  Filter,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { Product } from '../types/inventory';
import { mockProducts, categories, warehouses, statuses } from '../data/mockData';
import { StatusBadge } from '../components/StatusBadge';

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
    <div className="flex flex-col h-full space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Products</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your product inventory</p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name, SKU, category..."
            className="pl-9 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto ml-auto">
          <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Warehouse" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Warehouses</SelectItem>
              {warehouses.map((w) => (
                <SelectItem key={w} value={w}>
                  {w}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg bg-card shadow-sm overflow-x-auto flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Stock Qty</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Reorder Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.unitOfMeasure}</TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-medium',
                      product.stockQuantity <= product.reorderLevel && 'text-red-600'
                    )}
                  >
                    {product.stockQuantity}
                  </TableCell>
                  <TableCell>{product.warehouse}</TableCell>
                  <TableCell>{product.location}</TableCell>
                  <TableCell className="text-right">{product.reorderLevel}</TableCell>
                  <TableCell>
                    <StatusBadge status={product.status} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleOpenView(product)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenEdit(product)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Product
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleOpenDelete(product)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Product
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

      {/* Add/Edit Product Dialog */}
      <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{currentProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              <DialogDescription>
                {currentProduct
                  ? 'Update the details of the product below.'
                  : 'Fill in the details to add a new product to inventory.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                  />
                  {formErrors.name && (
                    <span className="text-sm text-red-500">{formErrors.name}</span>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sku">SKU/Code</Label>
                  <Input
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleFormChange}
                  />
                  {formErrors.sku && (
                    <span className="text-sm text-red-500">{formErrors.sku}</span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(val) => handleSelectChange('category', val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.category && (
                    <span className="text-sm text-red-500">{formErrors.category}</span>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unitOfMeasure">Unit of Measure</Label>
                  <Select
                    value={formData.unitOfMeasure}
                    onValueChange={(val) => handleSelectChange('unitOfMeasure', val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.unitOfMeasure && (
                    <span className="text-sm text-red-500">{formErrors.unitOfMeasure}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="stockQuantity">Initial Stock</Label>
                  <Input
                    id="stockQuantity"
                    name="stockQuantity"
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={handleFormChange}
                  />
                  {formErrors.stockQuantity && (
                    <span className="text-sm text-red-500">{formErrors.stockQuantity}</span>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reorderLevel">Reorder Level</Label>
                  <Input
                    id="reorderLevel"
                    name="reorderLevel"
                    type="number"
                    min="0"
                    value={formData.reorderLevel}
                    onChange={handleFormChange}
                  />
                  {formErrors.reorderLevel && (
                    <span className="text-sm text-red-500">{formErrors.reorderLevel}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="warehouse">Warehouse</Label>
                  <Select
                    value={formData.warehouse}
                    onValueChange={(val) => handleSelectChange('warehouse', val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((w) => (
                        <SelectItem key={w} value={w}>
                          {w}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.warehouse && (
                    <span className="text-sm text-red-500">{formErrors.warehouse}</span>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleFormChange}
                    placeholder="e.g. Aisle 3, Shelf B"
                  />
                  {formErrors.location && (
                    <span className="text-sm text-red-500">{formErrors.location}</span>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{currentProduct ? 'Save Changes' : 'Add Product'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Product Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>Detailed view of the selected product.</DialogDescription>
          </DialogHeader>
          {currentProduct && (
            <div className="grid gap-4 py-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold">{currentProduct.name}</h3>
                <StatusBadge status={currentProduct.status} />
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-6 text-sm">
                <div>
                  <span className="text-muted-foreground block mb-1">SKU/Code</span>
                  <p className="font-medium">{currentProduct.sku}</p>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Category</span>
                  <p className="font-medium">{currentProduct.category}</p>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Unit of Measure</span>
                  <p className="font-medium">{currentProduct.unitOfMeasure}</p>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Current Stock</span>
                  <p
                    className={cn(
                      'font-medium',
                      currentProduct.stockQuantity <= currentProduct.reorderLevel && 'text-red-600'
                    )}
                  >
                    {currentProduct.stockQuantity}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Reorder Level</span>
                  <p className="font-medium">{currentProduct.reorderLevel}</p>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Last Updated</span>
                  <p className="font-medium">
                    {new Date(currentProduct.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Warehouse</span>
                  <p className="font-medium">{currentProduct.warehouse}</p>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Location</span>
                  <p className="font-medium">{currentProduct.location}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              "{currentProduct?.name}" and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
