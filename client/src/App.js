import axios from "axios";
import React, { useEffect, useState } from "react";
import "./App.css";

const BLUE = "#172162"; //"rgb(23, 33, 98)";
const LIGHT_GREY = "#6e7484";
const BLACK = "#000000";

function App() {
  const [lineItems, setLineItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [hst, setHst] = useState(0);
  const [total, setTotal] = useState(0);
  const [postalcode, setPostalcode] = useState("");
  const [shipping, setShipping] = useState(15);

  useEffect(() => {
    async function fetchApi() {
      const res = await axios.get("http://localhost:5000/api/products");
      setLineItems(res.data);
      calculateFees();
    }

    fetchApi();
  }, []);

  const renderLineItems = () => {
    return lineItems.map((item) => (
      <div key={item.id} className="w-full h-80 flex flex-row relative">
        <div className="imgDiv py-10">
          <img src={item.image} />
        </div>
        <div className="descDiv">
          <p className="mt-5 font-bold" style={{ color: BLUE }}>
            {item.title.toUpperCase()} / {item.quantity}
          </p>
          <div className="flex flex-row mt-4">
            <div
              style={{ backgroundColor: item.swatchColor }}
              className="mr-5 w-10 h-10 rounded-3xl border-2 border-gray-300"
            ></div>
            <p className="mt-2">{item.swatchTitle}</p>
          </div>
        </div>
        <div className="descDiv absolute descDiv2 pt-5">
          <p>${item.price}</p>
          <p className="mt-16 mb-10">
            <span className="font-semibold">Estimated Delivery Date</span>:
            {item.deliveryDate}
          </p>
          <button
            style={{ textDecoration: "underline" }}
            onClick={() => removeLineItem(item.id)}
          >
            Remove
          </button>
        </div>
      </div>
    ));
  };

  const removeLineItem = (lineItemId) => {
    const filteredItems = lineItems.filter((item) => item.id !== lineItemId);
    // this.setState({ lineItems: filteredItems }, () => calculateFees());
    setLineItems(filteredItems);
  };

  useEffect(() => {
    calculateFees();
  }, [lineItems]);

  const addLineItem = (lineItem) => {
    setLineItems([...lineItems, lineItem]);
  };

  const calculateFees = () => {
    let subtotalCalc = 0;
    let taxCalc = 0;
    let shippingCalc = shipping;
    let totalCalc = 0;

    lineItems.map((item) => {
      subtotalCalc += item.price;
    });

    taxCalc = subtotalCalc * 0.13;

    totalCalc = subtotalCalc + taxCalc + shippingCalc;

    setSubtotal(subtotalCalc);
    setHst(taxCalc);
    setTotal(totalCalc);
  };

  const handlePostalcode = async (e) => {
    e.preventDefault();
    setPostalcode({ postalcode: e.target.value });

    const res = await axios.post("http://localhost:5000/api/products", {
      postalcode: e.target.value,
      lineItems: lineItems,
    });

    const deliveryDates = res.data;
    const updatedLineItems = lineItems.map((item) => {
      let updatedLineItem = item;
      deliveryDates.map((date) => {
        if (item.id === date.itemId) {
          updatedLineItem = {
            ...item,
            deliveryDate: date.deliveryDate,
          };
        }
      });
      return updatedLineItem;
    });

    setLineItems(updatedLineItems);
  };

  return (
    <div className="p-20">
      <h1 className="font-semibold text-4xl" style={{ color: BLUE }}>
        Your Cart
      </h1>
      {renderLineItems()}
      <div className="px-52 space-y-5">
        <div className="flex flex-row relative">
          <p className="font-semibold">Subtotal</p>
          <p className="font-semibold absolute right-0">
            ${subtotal.toFixed(2)}
          </p>
        </div>
        <div className="flex flex-row relative">
          <p className="font-semibold">Taxes (Estimated)</p>
          <p className="font-semibold absolute right-0">${hst.toFixed(2)}</p>
        </div>
        <div className="flex flex-row relative">
          <p className="font-semibold">Shipping</p>
          <p className="font-semibold absolute right-0">
            ${shipping.toFixed(2)}
          </p>
        </div>
        <div className="flex flex-row relative">
          <p className="font-bold">Total</p>
          <p className="font-bold absolute right-0">${total.toFixed(2)}</p>
        </div>
      </div>

      <form>
        <label>Postal Code</label>
        <input
          type="text"
          name="postalcode"
          placeholder="Example: L8V 4D1, etc"
          onChange={handlePostalcode}
          className="w-3/4 p-5 m-5"
        />
      </form>
    </div>
  );
}

export default App;
