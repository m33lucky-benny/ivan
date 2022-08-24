import { useState, useEffect, ChangeEvent } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Input,
} from "@mui/material/";

import axios from "axios";
import React from "react";

const createData = (
  ticker: string,
  qty: string,
  investedSum: string,
  last: string,
  change: string,
  //glToday: string,
  glToday: number,
  gainOrLoss: string
) => {
  return { ticker, qty, investedSum, last, change, glToday, gainOrLoss };
};

export const StockTracker = () => {
  const localStorageData = async () => {
    const stocks = JSON.parse(localStorage.getItem("stocks") || "[]");
    const rows = [];
    for (const stock of stocks) {
      const { lastPrice, change, glToday, gainOrLoss } = await generateStockInfo(
        stock.ticker,
        stock.qty,
        stock.investedSum
      );
      const newRow = createData(
        stock.ticker,
        stock.qty,
        stock.investedSum,
        lastPrice,
        change,
        glToday,
        gainOrLoss.toString()
      );
      rows.push(newRow);
    }
    setRows(rows);
  };

  useEffect(() => {
    (async () => {
      await localStorageData();
    })();
  }, []);

  const [rows, setRows] = useState<any[]>([]);
  const [formValues, setFormValues] = useState({
    ticker: "",
    qty: "",
    investedSum: "",
  });

  const handleChange = (prop: any) => (event: ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [prop]: event.target.value });
  };

  const addToLocalStorage = (ticker: string, qty: string, investedSum: string) => {
    const current = JSON.parse(localStorage.getItem("stocks") || "[]");
    const idx = current.findIndex((row: any) => row.ticker === ticker);
    if (idx !== -1) {
      current[idx] = {
        ticker,
        qty,
        investedSum,
      };
    } else {
      current.push({
        ticker,
        qty,
        investedSum,
      });
    }

    localStorage.setItem("stocks", JSON.stringify(current));
  };

  const generateStockInfo = async (ticker: string, qty: string, investedSum: string) => {
    const boughtPrice = (parseInt(investedSum) / parseInt(qty)).toFixed(1);
    const stockInfo = await getResultsByTicker(ticker, "USD");
    const lastPrice = stockInfo?.["PRICE"];
    const gainOrLoss = parseInt(qty) * (parseInt(lastPrice) - parseInt(boughtPrice));
    const change = stockInfo?.["CHANGEPCT24HOUR"].toFixed(1);
    //const glToday = stockInfo?.["CHANGE24HOUR"].toFixed(3);
    const glToday = parseInt(qty) * stockInfo?.["CHANGE24HOUR"].toFixed(1);

    return { lastPrice, change, glToday, gainOrLoss };
  };

  const addNewRow = async () => {
    const newRowsObject = [...rows];
    const idx = rows.findIndex((row) => row.ticker === formValues.ticker);
    if (idx !== -1) {
      const newQuantity = (parseInt(rows[idx].qty) + parseInt(formValues.qty)).toString();
      const newInvestedSum = (
        parseInt(formValues.investedSum) + parseInt(formValues.investedSum)
      ).toString();

      const { lastPrice, change, glToday, gainOrLoss } = await generateStockInfo(
        formValues.ticker,
        newQuantity,
        newInvestedSum
      );

      const newRow = createData(
        formValues.ticker,
        newQuantity,
        newInvestedSum,
        lastPrice,
        change,
        glToday,
        gainOrLoss.toString()
      );
      newRowsObject[idx] = newRow;
      addToLocalStorage(formValues.ticker, newQuantity, newInvestedSum);
      setRows([...newRowsObject]);
    } else {
      const { lastPrice, change, glToday, gainOrLoss } = await generateStockInfo(
        formValues.ticker,
        formValues.qty,
        formValues.investedSum
      );
      const newRow = createData(
        formValues.ticker,
        formValues.qty,
        formValues.investedSum,
        lastPrice,
        change,
        glToday,
        gainOrLoss.toString()
      );
      addToLocalStorage(formValues.ticker, formValues.qty, formValues.investedSum);
      setRows([...rows, newRow]);
    }
  };

  const getResultsByTicker = async (ticker: string, currency: string) => {
    const response = await axios.get(
      `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${ticker}&tsyms=${currency}`
    );
    const tickerCap = ticker.toUpperCase();
    const currencyCap = currency.toUpperCase();
    const data = response.data["RAW"][tickerCap][currencyCap];
    return data;
  };

  return (
    <div>
      <h1>Asset Tracker</h1>
      <TableContainer component={Paper}>
        <Table sx={{ 
          backgroundColor: "yellow",
          borderBottom: "2px solid black",
          minWidth: 700 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="right">Ticker</TableCell>
              <TableCell align="right">Qty</TableCell>
              <TableCell align="right">Invested Sum</TableCell>
              <TableCell align="right">Last</TableCell>
              <TableCell align="right">Change (%)</TableCell>
              <TableCell align="right">G/L Today</TableCell>
              <TableCell align="right">Gain/Loss</TableCell>
              {/* <TableCell align="right">Action</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length
              ? rows.map((row) => (
                  <TableRow
                    key={row.ticker + row.investedSum}
                    sx={{ backgroundColor: "yellow","&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell align="right">{row.ticker}</TableCell>
                    <TableCell align="right">{row.qty}</TableCell>
                    <TableCell align="right">{row.investedSum}</TableCell>
                    <TableCell align="right">{row.last}</TableCell>
                    <TableCell align="right">{row.change}</TableCell>
                    <TableCell align="right">{row.glToday}</TableCell>
                    <TableCell align="right">{row.gainOrLoss}</TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </TableContainer>
      <br />

      <FormControl >
        <InputLabel sx={{color: "green"}} htmlFor="ticker">Ticker</InputLabel>
        <Input sx={{color: "black"}} id="ticker" value={formValues.ticker} onChange={handleChange("ticker")} />
      </FormControl>
      <FormControl>
        <InputLabel sx={{color: "green"}}htmlFor="qty">qty</InputLabel>
        <Input sx={{color: "black"}} id="qty" value={formValues.qty} onChange={handleChange("qty")} />
      </FormControl>
      <FormControl>
        <InputLabel sx={{color: "green"}}htmlFor="price">Invested Sum</InputLabel>
        <Input sx={{color: "black"}} id="price" value={formValues.investedSum} onChange={handleChange("investedSum")} />
      </FormControl>

      <Button onClick={addNewRow}>Add New Row</Button>
    </div>
  );
};
