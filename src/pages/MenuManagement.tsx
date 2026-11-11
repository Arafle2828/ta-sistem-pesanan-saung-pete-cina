import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, SlidersHorizontal, X, UtensilsCrossed } from "lucide-react";
import {
  CATEGORIES,
  formatRp,
  api,
  mapDbMenuToUi,
  type MenuItem,
  type MenuCategory,
} from "../lib/api";

interface FormState {
  name: string;
  category: Exclude<MenuCategory, "Semua">;
  price: string;
  description: string;
  image: string;
  available: boolean;
}

const EMPTY_FORM: FormState = {
  name: "",
  category: "Lauk",
  price: "",
  description: "",
  image: "",
  available: true,
};

export default function MenuManagement() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<MenuCategory>("Semua");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | number | null>(null);

  useEffect(() => {
    let active = true;
    api
      .getMenus()
      .then((res) => {
        if (active && Array.isArray(res.menus)) {
          setItems(res.menus.map(mapDbMenuToUi));
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const filtered = items.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "Semua" || item.category === filterCat;
    return matchSearch && matchCat;
  });

  const openAdd = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditItem(item);
    setForm({
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      description: item.description,
      image: item.image || "",
      available: item.available,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    const payload = {
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      description: form.description.trim(),
      image_url: form.image.trim() || null,
      is_available: form.available,
    };

    try {
      if (editItem) {
        const res = await api.updateMenu(editItem.id, payload);
        const updated = mapDbMenuToUi(res.menu);
        setItems((prev) => prev.map((i) => (i.id === editItem.id ? updated : i)));
      } else {
        const res = await api.createMenu(payload);
        const created = mapDbMenuToUi(res.menu);
        setItems((prev) => [...prev, created]);
      }
      setShowModal(false);
    } catch {
      // Biarkan modal terbuka jika gagal menyimpan ke server
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await api.deleteMenu(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setDeleteId(null);
    } catch {
      setDeleteId(null);
    }
  };

  const toggleAvailability = async (id: string | number) => {
    try {
      const res = await api.toggleMenuAvailability(id);
      const updated = mapDbMenuToUi(res.menu);
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
    } catch {
      // Abaikan jika server gagal
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-beige px-6 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark font-serif">Manajemen Menu</h1>
          <p className="text-dark/50 text-sm mt-0.5">{items.length} menu terdaftar</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-primary-deep transition-colors shadow-sm shadow-primary/20 shrink-0"
        >
          <Plus size={16} />
          Tambah Menu
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-beige-dark p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama menu..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-beige-dark bg-beige text-sm text-dark outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          <SlidersHorizontal size={14} className="text-dark/30 mr-1" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterCat === cat
                  ? "bg-primary text-white"
                  : "text-dark/60 hover:text-primary hover:bg-primary/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-beige-dark overflow-hidden shadow-sm group hover:shadow-md transition-all"
          >
            <div className="relative">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-44 object-cover bg-beige-dark"
                />
              ) : (
                <div className="w-full h-32 bg-gradient-to-br from-primary/15 via-beige to-wood/15 flex items-center justify-center">
                  <UtensilsCrossed size={32} className="text-primary/35" />
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ${
                    item.available ? "bg-success text-white" : "bg-danger text-white"
                  }`}
                >
                  {item.available ? "Tersedia" : "Habis"}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <span className="bg-white/90 backdrop-blur-sm text-dark/60 text-xs font-semibold px-2 py-1 rounded-lg">
                  {item.category}
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-bold text-dark text-sm leading-snug">{item.name}</h3>
              </div>
              <p className="text-xs text-dark/50 leading-relaxed line-clamp-2 mb-3">
                {item.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary text-base">{formatRp(item.price)}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleAvailability(item.id)}
                    className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all ${
                      item.available
                        ? "border-danger/30 text-danger hover:bg-danger/5"
                        : "border-success/30 text-success hover:bg-success/5"
                    }`}
                  >
                    {item.available ? "Habiskan" : "Aktifkan"}
                  </button>
                  <button
                    onClick={() => openEdit(item)}
                    className="w-8 h-8 rounded-lg border border-beige-dark flex items-center justify-center text-dark/40 hover:text-primary hover:border-primary transition-all"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => setDeleteId(item.id)}
                    className="w-8 h-8 rounded-lg border border-beige-dark flex items-center justify-center text-dark/40 hover:text-danger hover:border-danger transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-dark/30">
          <Search size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Tidak ada menu ditemukan</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-beige-dark">
              <h2 className="font-bold text-dark">
                {editItem ? "Edit Menu" : "Tambah Menu Baru"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-xl border border-beige-dark flex items-center justify-center text-dark/40 hover:text-dark"
              >
                <X size={16} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-dark/60 mb-1.5 block">
                  URL Foto Menu (opsional)
                </label>
                <input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full border border-beige-dark rounded-xl px-3 py-2 text-sm text-dark bg-beige outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-dark/60 mb-1.5 block">Nama Menu</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Contoh: Ayam Bakakak Taliwang"
                  className="w-full border border-beige-dark rounded-xl px-3 py-2.5 text-sm text-dark bg-beige outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-dark/60 mb-1.5 block">
                    Kategori
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value as Exclude<MenuCategory, "Semua">,
                      })
                    }
                    className="w-full border border-beige-dark rounded-xl px-3 py-2.5 text-sm text-dark bg-beige outline-none focus:border-primary transition-colors"
                  >
                    {CATEGORIES.filter((c) => c !== "Semua").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-dark/60 mb-1.5 block">
                    Harga (Rp)
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="39000"
                    className="w-full border border-beige-dark rounded-xl px-3 py-2.5 text-sm text-dark bg-beige outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-dark/60 mb-1.5 block">
                  Deskripsi
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Deskripsi singkat menu..."
                  className="w-full border border-beige-dark rounded-xl px-3 py-2.5 text-sm text-dark bg-beige outline-none focus:border-primary transition-colors resize-none"
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setForm({ ...form, available: !form.available })}
                  className={`w-10 h-6 rounded-full transition-all relative ${
                    form.available ? "bg-success" : "bg-dark/20"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                      form.available ? "left-5" : "left-1"
                    }`}
                  />
                </button>
                <span className="text-sm text-dark/70 font-medium">
                  {form.available ? "Tersedia" : "Habis"}
                </span>
              </div>
            </div>
            <div className="px-6 pb-5 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-beige-dark text-dark/60 font-semibold py-2.5 rounded-xl text-sm hover:bg-beige transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-primary text-white font-bold py-2.5 rounded-xl text-sm hover:bg-primary-deep transition-colors"
              >
                {editItem ? "Simpan Perubahan" : "Tambah Menu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-danger" />
            </div>
            <h2 className="font-bold text-dark text-lg mb-2">Hapus Menu?</h2>
            <p className="text-dark/50 text-sm mb-5">
              Menu ini akan dihapus permanen dan tidak dapat dipulihkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border border-beige-dark text-dark/60 font-semibold py-2.5 rounded-xl text-sm hover:bg-beige transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-danger text-white font-bold py-2.5 rounded-xl text-sm hover:bg-danger/90 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
