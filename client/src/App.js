import axios from "axios";
import React, { Component } from "react";
import "./App.css";

const BLUE = "#172162"; //"rgb(23, 33, 98)";
const LIGHT_GREY = "#6e7484";
const BLACK = "#000000";

export default class App extends Component {
  state = {
    lineItems: [],
    subtotal: 0,
    hst: 0,
    total: 0,
    postalcode: "",
    shipping: 15,
  };

  componentDidMount = async () => {
    const res = await axios.get("http://localhost:5000/api/products");
    this.setState({ lineItems: res.data });
    this.calculateFees();
  };

  renderLineItems() {
    return this.state.lineItems.map((item) => (
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
            onClick={() => this.removeLineItem(item.id)}
          >
            Remove
          </button>
        </div>
      </div>
    ));
  }

  removeLineItem = (lineItemId) => {
    console.log(lineItemId);
    const filteredItems = this.state.lineItems.filter(
      (item) => item.id !== lineItemId
    );
    console.log(filteredItems);
    this.setState({ lineItems: filteredItems });
    this.calculateFees();
  };

  addLineItem = (lineItem) => {
    this.setState({ lineItem: [...this.state.lineItems, lineItem] });
  };

  calculateFees = () => {
    let subtotal = 0;
    let tax = 0;
    let shipping = this.state.shipping;
    let total = 0;

    this.state.lineItems.map((item) => {
      subtotal += item.price;
    });
    tax = subtotal * 0.13;

    total = subtotal + tax + shipping;

    this.setState({ subtotal });
    this.setState({ hst: tax });
    this.setState({ total });
  };

  handlePostalcode = async (e) => {
    e.preventDefault();
    this.setState({ postalcode: e.target.value });

    const res = await axios.post("http://localhost:5000/api/products", {
      postalcode: e.target.value,
      lineItems: this.state.lineItems,
    });

    const deliveryDates = res.data;
    const updatedLineItems = this.state.lineItems.map((item) => {
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

    this.setState({ lineItems: updatedLineItems });
  };

  render() {
    return (
      <div className="p-20">
        <h1 className="font-semibold text-4xl" style={{ color: BLUE }}>
          Your Cart
        </h1>
        {this.renderLineItems()}
        <div className="px-52 space-y-5">
          <div className="flex flex-row relative">
            <p className="font-semibold">Subtotal</p>
            <p className="font-semibold absolute right-0">
              ${this.state.subtotal.toFixed(2)}
            </p>
          </div>
          <div className="flex flex-row relative">
            <p className="font-semibold">Taxes (Estimated)</p>
            <p className="font-semibold absolute right-0">
              ${this.state.hst.toFixed(2)}
            </p>
          </div>
          <div className="flex flex-row relative">
            <p className="font-semibold">Shipping</p>
            <p className="font-semibold absolute right-0">
              ${this.state.shipping.toFixed(2)}
            </p>
          </div>
          <div className="flex flex-row relative">
            <p className="font-bold">Total</p>
            <p className="font-bold absolute right-0">
              ${this.state.total.toFixed(2)}
            </p>
          </div>
        </div>

        <form>
          <label>Postal Code</label>
          <input
            type="text"
            name="postalcode"
            placeholder="Example: L8V 4D1, etc"
            onChange={this.handlePostalcode}
            className="w-3/4 p-5 m-5"
          />
        </form>
      </div>
    );
  }
}
