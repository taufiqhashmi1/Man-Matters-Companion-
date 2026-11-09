"use client";

import { useState } from "react";
import {
  Package,
  Plus,
  ExternalLink,
  Pause,
  Play,
  Trash2,
  Edit,
  ShieldCheck,
  Calendar,
  AlertCircle,
  X,
  Check,
} from "lucide-react";
import { useAppStore } from "@/lib/store/use-app-store";
import { Product, ProductCategory, ProductStatus } from "@/types/domain";
import { formatFriendlyDate, getTodayDateString } from "@/lib/dates";

const CATEGORIES: ProductCategory[] = ["hair", "skin", "nutrition", "wellness", "other"];

export default function ProductsPage() {
  const products = useAppStore((s) => s.products);
  const addProduct = useAppStore((s) => s.addProduct);
  const updateProduct = useAppStore((s) => s.updateProduct);
  const toggleProductStatus = useAppStore((s) => s.toggleProductStatus);
  const deleteProduct = useAppStore((s) => s.deleteProduct);
  const routineItems = useAppStore((s) => s.routineItems);

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("Man Matters");
  const [category, setCategory] = useState<ProductCategory>("hair");
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [status, setStatus] = useState<ProductStatus>("active");
  const [instructionText, setInstructionText] = useState("");
  const [sourceLabel, setSourceLabel] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  const openAddModal = () => {
    setEditingProduct(null);
    setName("");
    setBrand("Man Matters");
    setCategory("hair");
    setStartDate(getTodayDateString());
    setStatus("active");
    setInstructionText("");
    setSourceLabel("");
    setSourceUrl("");
    setModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setBrand(prod.brand || "Man Matters");
    setCategory(prod.category);
    setStartDate(prod.startDate || getTodayDateString());
    setStatus(prod.status);
    setInstructionText(prod.instructionText || "");
    setSourceLabel(prod.sourceLabel || "");
    setSourceUrl(prod.sourceUrl || "");
    setModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: name.trim(),
        brand: brand.trim(),
        category,
        startDate,
        status,
        instructionText: instructionText.trim() || undefined,
        sourceLabel: sourceLabel.trim() || undefined,
        sourceUrl: sourceUrl.trim() || undefined,
      });
    } else {
      addProduct({
        name: name.trim(),
        brand: brand.trim(),
        category,
        status,
        startDate,
        instructionText: instructionText.trim() || undefined,
        sourceLabel: sourceLabel.trim() || undefined,
        sourceUrl: sourceUrl.trim() || undefined,
      });
    }

    setModalOpen(false);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      setProductToDelete(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (activeCategory === "all") return true;
    return p.category === activeCategory;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-wellness-border pb-6">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-wellness-accent mb-1">
            Personal Care Inventory
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-wellness-primary tracking-tight">
            Product Cabinet
          </h1>
          <p className="text-sm text-wellness-secondary mt-1">
            Manage your saved wellness products, verified packaging guidelines, and official instructions.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-control bg-wellness-accent text-white font-medium hover:bg-wellness-accent-hover transition-colors shadow-card text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
            activeCategory === "all"
              ? "bg-wellness-accent text-white shadow-sm"
              : "bg-wellness-surface text-wellness-secondary border border-wellness-border hover:text-wellness-primary"
          }`}
        >
          All Products ({products.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = products.filter((p) => p.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                activeCategory === cat
                  ? "bg-wellness-accent text-white shadow-sm"
                  : "bg-wellness-surface text-wellness-secondary border border-wellness-border hover:text-wellness-primary"
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center rounded-card bg-wellness-surface border border-wellness-border space-y-3">
          <Package className="w-10 h-10 text-wellness-muted mx-auto" />
          <h3 className="font-semibold text-wellness-primary text-base">No products found</h3>
          <p className="text-xs text-wellness-secondary max-w-sm mx-auto">
            {activeCategory === "all"
              ? "Your cabinet is currently empty. Add your first product to link verified instructions to daily routines."
              : `No products in the ${activeCategory} category yet.`}
          </p>
          <button
            onClick={openAddModal}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-control bg-wellness-accent text-white text-xs font-medium hover:bg-wellness-accent-hover"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProducts.map((prod) => {
            const linkedRoutines = routineItems.filter((i) => i.productId === prod.id && i.isActive);
            const isPaused = prod.status === "paused";

            return (
              <div
                key={prod.id}
                className={`p-6 rounded-card border transition-all flex flex-col justify-between ${
                  isPaused
                    ? "bg-wellness-surface/70 border-wellness-border opacity-75"
                    : "bg-wellness-surface border-wellness-border shadow-subtle hover:shadow-card"
                }`}
              >
                <div className="space-y-4">
                  {/* Top Bar: Brand & Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {prod.brand && (
                        <span className="text-[11px] font-semibold tracking-wider uppercase text-wellness-muted">
                          {prod.brand}
                        </span>
                      )}
                      <h3 className="font-bold text-base text-wellness-primary mt-0.5">
                        {prod.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-wellness-accent-soft text-wellness-accent">
                        {prod.category}
                      </span>
                      {isPaused && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-wellness-warning-soft text-wellness-warning">
                          Paused
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Verified Instructions Box */}
                  <div className="p-3.5 rounded-control bg-wellness-surface-alt border border-wellness-border-subtle space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-wellness-primary">
                      <ShieldCheck className="w-3.5 h-3.5 text-wellness-accent" />
                      <span>Verified Label Instructions</span>
                    </div>
                    {prod.instructionText ? (
                      <p className="text-wellness-secondary leading-relaxed whitespace-pre-line">
                        {prod.instructionText}
                      </p>
                    ) : (
                      <p className="text-wellness-muted italic">
                        No verified instructions added.
                      </p>
                    )}

                    {prod.sourceLabel && (
                      <div className="pt-1.5 border-t border-wellness-border-subtle flex items-center justify-between text-[10px] text-wellness-muted">
                        <span>Source: {prod.sourceLabel}</span>
                        {prod.sourceUrl && (
                          <a
                            href={prod.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-wellness-accent hover:underline"
                          >
                            <span>Verify label</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Metadata Row: Routine Link & Start Date */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-wellness-secondary pt-1">
                    {prod.startDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-wellness-muted" />
                        <span>Started {formatFriendlyDate(prod.startDate)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-wellness-accent" />
                      <span>
                        {linkedRoutines.length > 0
                          ? `Linked in ${linkedRoutines.length} routine activities`
                          : "Not linked in any routine"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-5 mt-5 border-t border-wellness-border-subtle flex items-center justify-between">
                  <button
                    onClick={() => toggleProductStatus(prod.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-wellness-secondary hover:text-wellness-primary px-2.5 py-1 rounded border border-wellness-border hover:bg-wellness-surface-alt transition-colors"
                  >
                    {isPaused ? (
                      <>
                        <Play className="w-3 h-3 text-wellness-accent" />
                        <span>Resume</span>
                      </>
                    ) : (
                      <>
                        <Pause className="w-3 h-3 text-wellness-warning" />
                        <span>Pause</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(prod)}
                      className="p-1.5 text-wellness-secondary hover:text-wellness-primary rounded hover:bg-wellness-surface-alt border border-transparent hover:border-wellness-border transition-colors"
                      title="Edit Product"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setProductToDelete(prod)}
                      className="p-1.5 text-wellness-danger hover:text-wellness-danger/80 rounded hover:bg-wellness-danger-soft transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-wellness-surface rounded-card border border-wellness-border shadow-elevated w-full max-w-lg p-6 space-y-5 animate-fade-in my-8">
            <div className="flex items-center justify-between pb-3 border-b border-wellness-border">
              <h3 className="font-bold text-base text-wellness-primary">
                {editingProduct ? "Edit Product Details" : "Add Product to Cabinet"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-wellness-secondary hover:text-wellness-primary rounded-full hover:bg-wellness-surface-alt"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-wellness-primary block">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Minoxidil 5% Topical Solution"
                  className="w-full px-3 py-2 rounded-control bg-wellness-surface-alt border border-wellness-border text-wellness-primary focus:outline-none focus:border-wellness-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-wellness-primary block">Brand</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Man Matters"
                    className="w-full px-3 py-2 rounded-control bg-wellness-surface-alt border border-wellness-border text-wellness-primary focus:outline-none focus:border-wellness-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-wellness-primary block">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 rounded-control bg-wellness-surface-alt border border-wellness-border text-wellness-primary capitalize focus:outline-none focus:border-wellness-accent"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="capitalize">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-wellness-primary block">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-control bg-wellness-surface-alt border border-wellness-border text-wellness-primary focus:outline-none focus:border-wellness-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-wellness-primary block">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProductStatus)}
                    className="w-full px-3 py-2 rounded-control bg-wellness-surface-alt border border-wellness-border text-wellness-primary capitalize focus:outline-none focus:border-wellness-accent"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-wellness-primary block">
                  Verified Label Instructions
                </label>
                <textarea
                  rows={3}
                  value={instructionText}
                  onChange={(e) => setInstructionText(e.target.value)}
                  placeholder="Enter exact directions from packaging label (e.g. Apply 1ml twice daily to dry scalp)."
                  className="w-full px-3 py-2 rounded-control bg-wellness-surface-alt border border-wellness-border text-wellness-primary focus:outline-none focus:border-wellness-accent"
                />
                <p className="text-[10px] text-wellness-muted">
                  AI companion will rely strictly on these verified instructions for product Q&A.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-wellness-primary block">Source Label</label>
                  <input
                    type="text"
                    value={sourceLabel}
                    onChange={(e) => setSourceLabel(e.target.value)}
                    placeholder="e.g. Product Box / Leaflet"
                    className="w-full px-3 py-2 rounded-control bg-wellness-surface-alt border border-wellness-border text-wellness-primary focus:outline-none focus:border-wellness-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-wellness-primary block">Source URL (optional)</label>
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-control bg-wellness-surface-alt border border-wellness-border text-wellness-primary focus:outline-none focus:border-wellness-accent"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-wellness-border flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-control text-wellness-secondary hover:text-wellness-primary font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-control bg-wellness-accent text-white font-medium hover:bg-wellness-accent-hover transition-colors shadow-subtle"
                >
                  {editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-wellness-surface rounded-card border border-wellness-border shadow-elevated w-full max-w-sm p-6 space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 text-wellness-danger">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h4 className="font-bold text-base text-wellness-primary">Remove Product</h4>
            </div>
            <p className="text-xs text-wellness-secondary leading-relaxed">
              Are you sure you want to remove <strong>{productToDelete.name}</strong> from your cabinet?
              Existing journal entries will be safely preserved.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="px-3.5 py-1.5 rounded-control text-xs font-medium text-wellness-secondary hover:text-wellness-primary"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-1.5 rounded-control text-xs font-medium bg-wellness-danger text-white hover:bg-wellness-danger/90 transition-colors"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
