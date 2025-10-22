// ...existing code...
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function Record() {
  const [form, setForm] = useState({
    time: "",
    to_currency: "",
    from_currency: "",
    sell_price: "",
    buy_price: "",
  });
  const [isNew, setIsNew] = useState(true);
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      const id = params.id?.toString() || undefined;
      if (!id) return;
      setIsNew(false);
      const response = await fetch(
        `http://localhost:5050/record/${params.id.toString()}`
      );
      if (!response.ok) {
        console.error(`An error has occurred: ${response.statusText}`);
        return;
      }
      const record = await response.json();
      if (!record) {
        console.warn(`Record with id ${id} not found`);
        navigate("/");
        return;
      }
      // convert ISO time to input[type=datetime-local] value
      const toLocalInputValue = (iso) => {
        if (!iso) return "";
        const d = new Date(iso);
        const off = d.getTimezoneOffset();
        const local = new Date(d.getTime() - off * 60000);
        return local.toISOString().slice(0, 16);
      };

      setForm({
        time: toLocalInputValue(record.time),
        to_currency: record.to_currency || "",
        from_currency: record.from_currency || "",
        sell_price: record.sell_price?.toString() || "",
        buy_price: record.buy_price?.toString() || "",
      });
    }
    fetchData();
    return;
  }, [params.id, navigate]);

  function updateForm(value) {
    return setForm((prev) => {
      return { ...prev, ...value };
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    // prepare payload: convert datetime-local back to ISO and prices to numbers
    const payload = {
      ...form,
      time: form.time ? new Date(form.time).toISOString() : null,
      sell_price: form.sell_price !== "" ? Number(form.sell_price) : null,
      buy_price: form.buy_price !== "" ? Number(form.buy_price) : null,
    };

    try {
      let response;
      if (isNew) {
        response = await fetch("http://localhost:5050/record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`http://localhost:5050/record/${params.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("A problem occurred adding or updating a record: ", error);
    } finally {
      setForm({
        time: "",
        to_currency: "",
        from_currency: "",
        sell_price: "",
        buy_price: "",
      });
      navigate("/");
    }
  }

  return (
    <>
      <h3 className="text-lg font-semibold p-4">Create/Update Currency Record</h3>
      <form onSubmit={onSubmit} className="border rounded-lg overflow-hidden p-4">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-slate-900/10 pb-12 md:grid-cols-2">
          <div>
            <h2 className="text-base font-semibold leading-7 text-slate-900">
              Currency Data
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Timestamp and prices for a currency exchange entry.
            </p>
          </div>

          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 ">
            <div>
              <label htmlFor="time" className="block text-sm font-medium leading-6 text-slate-900">
                Time
              </label>
              <div className="mt-2">
                <input
                  type="datetime-local"
                  id="time"
                  value={form.time}
                  onChange={(e) => updateForm({ time: e.target.value })}
                  className="block w-full rounded-md border py-1.5 px-2"
                />
              </div>
            </div>

            <div>
              <label htmlFor="from_currency" className="block text-sm font-medium leading-6 text-slate-900">
                From Currency
              </label>
              <div className="mt-2">
                <input
                  id="from_currency"
                  value={form.from_currency}
                  onChange={(e) => updateForm({ from_currency: e.target.value })}
                  className="block w-full rounded-md border py-1.5 px-2"
                />
              </div>
            </div>

            <div>
              <label htmlFor="to_currency" className="block text-sm font-medium leading-6 text-slate-900">
                To Currency
              </label>
              <div className="mt-2">
                <input
                  id="to_currency"
                  value={form.to_currency}
                  onChange={(e) => updateForm({ to_currency: e.target.value })}
                  className="block w-full rounded-md border py-1.5 px-2"
                />
              </div>
            </div>

            <div>
              <label htmlFor="sell_price" className="block text-sm font-medium leading-6 text-slate-900">
                Sell Price
              </label>
              <div className="mt-2">
                <input
                  id="sell_price"
                  type="number"
                  value={form.sell_price}
                  onChange={(e) => updateForm({ sell_price: e.target.value })}
                  className="block w-full rounded-md border py-1.5 px-2"
                />
              </div>
            </div>

            <div>
              <label htmlFor="buy_price" className="block text-sm font-medium leading-6 text-slate-900">
                Buy Price
              </label>
              <div className="mt-2">
                <input
                  id="buy_price"
                  type="number"
                  value={form.buy_price}
                  onChange={(e) => updateForm({ buy_price: e.target.value })}
                  className="block w-full rounded-md border py-1.5 px-2"
                />
              </div>
            </div>
          </div>
        </div>

        <input
          type="submit"
          value="Save Currency Record"
          className="inline-flex items-center justify-center whitespace-nowrap text-md font-medium h-9 rounded-md px-3 cursor-pointer mt-4 border"
        />
      </form>
    </>
  );
}
// ...existing code...