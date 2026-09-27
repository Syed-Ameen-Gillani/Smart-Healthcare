import React, { useEffect, useMemo, useState } from "react";
import { FaCartShopping, FaClockRotateLeft, FaMinus, FaPlus, FaPrescription } from "react-icons/fa6";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import { fileAPI, medicineOrderAPI } from "../utils/api";

function CheckoutForm({ cartItems, total, reports, form, setForm, submitting, submitOrder }) {
  return (
    <form onSubmit={submitOrder} className="space-y-4">
      <div>
        <h2 className="font-bold text-xl text-gray-900 dark:text-white">Demo Cart</h2>
        <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">Academic demonstration only. No payment or real fulfillment.</p>
      </div>
      {cartItems.length ? <div className="space-y-2">{cartItems.map((item) => (
        <div key={item._id} className="flex justify-between gap-4 text-sm text-gray-700 dark:text-gray-200">
          <span>{item.name} x {item.quantity}</span><span className="shrink-0">Rs {item.price * item.quantity}</span>
        </div>
      ))}</div> : <p className="text-sm text-gray-500">Your demo cart is empty.</p>}
      <div className="flex justify-between font-bold border-t border-gray-200 dark:border-gray-700 pt-3 text-gray-900 dark:text-white"><span>Total</span><span>Rs {total}</span></div>
      <div><label htmlFor="delivery-name" className="block text-sm font-semibold mb-1 dark:text-gray-200">Delivery name</label><input id="delivery-name" required autoComplete="name" value={form.delivery_name} onChange={(event) => setForm({ ...form, delivery_name: event.target.value })} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 dark:bg-gray-700 dark:text-white" /></div>
      <div><label htmlFor="delivery-phone" className="block text-sm font-semibold mb-1 dark:text-gray-200">Phone</label><input id="delivery-phone" type="tel" inputMode="tel" required autoComplete="tel" value={form.delivery_phone} onChange={(event) => setForm({ ...form, delivery_phone: event.target.value })} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 dark:bg-gray-700 dark:text-white" /></div>
      <div><label htmlFor="delivery-address" className="block text-sm font-semibold mb-1 dark:text-gray-200">Demonstration address</label><textarea id="delivery-address" required rows="3" autoComplete="street-address" value={form.delivery_address} onChange={(event) => setForm({ ...form, delivery_address: event.target.value })} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 dark:bg-gray-700 dark:text-white" /></div>
      <div><label htmlFor="order-report" className="block text-sm font-semibold mb-1 dark:text-gray-200">Report reference</label><select id="order-report" value={form.report_id} onChange={(event) => setForm({ ...form, report_id: event.target.value })} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 dark:bg-gray-700 dark:text-white"><option value="">No report selected</option>{reports.map((report) => <option key={report._id} value={report._id}>{report.filename}</option>)}</select><p className="text-xs text-gray-500 mt-1">Required only for prescription-marked demo items.</p></div>
      <button disabled={submitting || !cartItems.length} className="w-full bg-gradient-to-r from-btn2 to-btn1 hover:brightness-95 text-white py-3 rounded-lg font-semibold disabled:opacity-50">{submitting ? "Submitting..." : "Submit Demo Order"}</button>
    </form>
  );
}

export default function MedicineStore() {
  const [searchParams] = useSearchParams();
  const sourceReportId = searchParams.get("reportId") || "";
  const [tab, setTab] = useState("catalog");
  const [medicines, setMedicines] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reports, setReports] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [form, setForm] = useState({ delivery_name: "", delivery_phone: "", delivery_address: "", report_id: sourceReportId });

  const load = async () => {
    setLoading(true);
    try {
      const [catalog, history, files] = await Promise.all([medicineOrderAPI.catalog(), medicineOrderAPI.list(), fileAPI.getFiles()]);
      setMedicines(catalog.data?.medicines || []);
      setOrders(history.data?.orders || []);
      setReports((files.data?.files || []).filter((file) => file.analyzed));
    } catch (error) {
      toast.error(error.message || "Failed to load demo store");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!showCheckout) return undefined;
    document.body.style.overflow = "hidden";
    const handleBack = (event) => { event.preventDefault(); setShowCheckout(false); };
    document.addEventListener("smarthealth:back", handleBack);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("smarthealth:back", handleBack);
    };
  }, [showCheckout]);

  const cartItems = useMemo(() => medicines.filter((item) => cart[item._id]).map((item) => ({ ...item, quantity: cart[item._id] })), [medicines, cart]);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const requiresPrescription = cartItems.some((item) => item.requires_prescription);

  const changeQuantity = (id, amount) => setCart((current) => {
    const next = Math.max(0, Math.min(10, (current[id] || 0) + amount));
    const updated = { ...current };
    if (next) updated[id] = next; else delete updated[id];
    return updated;
  });

  const submitOrder = async (event) => {
    event.preventDefault();
    if (!cartItems.length) return toast.error("Add at least one demo medicine");
    if (requiresPrescription && !form.report_id) return toast.error("Select an uploaded report for prescription-required items");
    setSubmitting(true);
    try {
      const response = await medicineOrderAPI.create({ ...form, report_id: form.report_id || null, items: cartItems.map((item) => ({ medicine_id: item._id, quantity: item.quantity })) });
      toast.success(response.message || "Demo order submitted");
      setCart({});
      setForm((current) => ({ ...current, report_id: "" }));
      setShowCheckout(false);
      await load();
      setTab("orders");
    } catch (error) {
      toast.error(error.message || "Order failed");
    } finally {
      setSubmitting(false);
    }
  };

  const checkoutProps = { cartItems, total, reports, form, setForm, submitting, submitOrder };

  return (
    <main className="app-page bg-gray-50 dark:bg-gray-950">
      <div className="app-page__inner max-w-6xl">
        <div className="mb-5"><h1 className="text-3xl font-bold text-gray-900 dark:text-white">Demo Medicine Store</h1><p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Fictional catalog for the academic demonstration. No payment or real pharmacy fulfillment.</p></div>
        <div className="grid grid-cols-2 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden mb-5 max-w-sm" role="tablist">
          <button role="tab" aria-selected={tab === "catalog"} onClick={() => setTab("catalog")} className={`px-4 py-2 flex items-center justify-center gap-2 ${tab === "catalog" ? "bg-gradient-to-r from-btn2 to-btn1 text-white" : "bg-white dark:bg-gray-800 dark:text-white"}`}><FaCartShopping /> Catalog</button>
          <button role="tab" aria-selected={tab === "orders"} onClick={() => setTab("orders")} className={`px-4 py-2 flex items-center justify-center gap-2 ${tab === "orders" ? "bg-gradient-to-r from-btn2 to-btn1 text-white" : "bg-white dark:bg-gray-800 dark:text-white"}`}><FaClockRotateLeft /> Orders</button>
        </div>

        {loading ? <div className="space-y-3" aria-live="polite"><div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" /><div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" /></div> : tab === "catalog" ? (
          <div className="grid lg:grid-cols-[1fr_360px] gap-6">
            <section className="grid sm:grid-cols-2 gap-4 pb-20 lg:pb-0">
              {medicines.length ? medicines.map((item) => <article key={item._id} className="group overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:border-blue-600 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-btn2 to-btn1 p-5">
                  <span className="grid h-16 w-16 shrink-0 place-items-center rounded-lg border border-white/40 bg-white/15 text-3xl text-white"><FaPrescription /></span>
                  <div className="text-right text-white"><p className="text-xs text-white/85">Demo catalog price</p><strong className="block mt-1 text-2xl">Rs {item.price}</strong></div>
                </div>
                <div className="p-4"><h2 className="font-bold text-lg text-gray-900 dark:text-white">{item.name}</h2><p className="text-sm text-blue-700 dark:text-blue-300">{item.generic_name}</p>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 mt-3 min-h-10">{item.description}</p>
                <div className="mt-4 border-t border-gray-100 pt-3 dark:border-gray-700"><span className="text-xs font-semibold text-gray-500 dark:text-gray-400">DEMONSTRATION ITEM</span></div>
                {item.requires_prescription && <p className="text-xs text-amber-700 dark:text-amber-300 mt-2 flex gap-1 items-center"><FaPrescription /> Report reference required</p>}
                <div className="flex items-center justify-end gap-3 mt-4"><button type="button" aria-label={`Decrease ${item.name} quantity`} onClick={() => changeQuantity(item._id, -1)} className="w-11 h-11 grid place-items-center border border-gray-300 rounded-lg dark:border-gray-600 dark:text-white"><FaMinus /></button><span className="w-6 text-center font-bold dark:text-white" aria-live="polite">{cart[item._id] || 0}</span><button type="button" aria-label={`Increase ${item.name} quantity`} onClick={() => changeQuantity(item._id, 1)} className="w-11 h-11 grid place-items-center rounded-lg bg-gradient-to-r from-btn2 to-btn1 text-white"><FaPlus /></button></div></div>
              </article>) : <div className="sm:col-span-2 bg-white dark:bg-gray-800 border rounded-lg p-8 text-center dark:text-white"><p>No demo medicines are available.</p><p className="text-sm text-gray-500 mt-2">Check the backend database connection and reload this page.</p></div>}
            </section>
            <aside className="hidden lg:block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 h-fit sticky top-5"><CheckoutForm {...checkoutProps} /></aside>
            {cartItems.length > 0 && <button type="button" onClick={() => setShowCheckout(true)} className="lg:hidden fixed left-4 right-4 bottom-[calc(var(--app-bottom-nav-height)+var(--safe-bottom)+12px)] z-[35] bg-gradient-to-r from-btn2 to-btn1 text-white min-h-14 rounded-lg shadow-xl px-4 flex items-center justify-between font-bold"><span>{itemCount} item{itemCount !== 1 ? "s" : ""}</span><span>Checkout · Rs {total}</span></button>}
          </div>
        ) : (
          <section className="space-y-3">{orders.length ? orders.map((order) => <article key={order._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"><div className="flex justify-between gap-3"><div className="min-w-0"><h2 className="font-bold dark:text-white">Order {order._id.slice(-6).toUpperCase()}</h2><p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</p></div><span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full h-fit text-sm font-semibold">{order.status}</span></div><ul className="mt-3 text-sm dark:text-gray-200">{order.items.map((item) => <li key={item.medicine_id}>{item.name} x {item.quantity}</li>)}</ul><p className="font-bold mt-3 dark:text-white">Total: Rs {order.total}</p>{order.report_name && <p className="text-sm text-gray-500 mt-1">Report: {order.report_name}</p>}</article>) : <div className="bg-white dark:bg-gray-800 border rounded-lg p-8 text-center text-gray-600 dark:text-gray-300">No demo orders yet.</div>}</section>
        )}
      </div>

      {showCheckout && <div className="app-fullscreen-overlay z-[60] bg-black/50 flex items-end lg:hidden" role="presentation">
        <section role="dialog" aria-modal="true" aria-labelledby="checkout-title" className="bg-white dark:bg-gray-800 w-full max-h-[92dvh] rounded-t-lg flex flex-col">
          <header className="flex items-center justify-between p-4 border-b dark:border-gray-700"><h2 id="checkout-title" className="text-xl font-bold dark:text-white">Checkout</h2><button type="button" onClick={() => setShowCheckout(false)} className="app-icon-button" aria-label="Close checkout"><FaTimes /></button></header>
          <div className="overflow-y-auto p-4 pb-[calc(16px+var(--safe-bottom))]"><CheckoutForm {...checkoutProps} /></div>
        </section>
      </div>}
    </main>
  );
}
