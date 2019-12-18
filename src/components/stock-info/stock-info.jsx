import React from 'react';
import Chart from "react-google-charts";
import axios from 'axios';

import './stock-info.scss';
import {StocksContext} from "../../contexts/stocks-context";
import backRequest from "../../api/back-request";

class StockInfo extends React.Component {
    static contextType = StocksContext;
    state = {
        inputCount: "",
        loading: false,
        data:  undefined,
        stock: {}
    };

    componentDidMount() {
        this.setState({ loading: true });
        axios.get(`https://financialmodelingprep.com/api/v3/historical-price-full/${this.props.stockInfo.symbol}?timeseries=30`).then(responce => {
            let data = [['day', responce.data.symbol, responce.data.symbol, responce.data.symbol, responce.data.symbol]],
                historical = responce.data.historical;
            historical.forEach(({ date, open, high, low, close, change }) => {
                data.push(change >= 0 ? [new Date(date), high, open, close, low] : [new Date(date), low, open, close, high]);
            });
            this.setState({ data,  loading: false});
          /*  backRequest.get(`/userstocks/${this.props.stockInfo.symbol}`).then(responce => {
                const stock = responce.data.data;
                this.setState({ stock });
            })*/
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.stockInfo.symbol !== prevProps.stockInfo.symbol) {
            this.setState({ loading: true, data: undefined, inputCount: "" });
            axios.get(`https://financialmodelingprep.com/api/v3/historical-price-full/${this.props.stockInfo.symbol}?timeseries=30`).then(responce => {
                let data = [['day', responce.data.symbol, responce.data.symbol, responce.data.symbol, responce.data.symbol]],
                    historical = responce.data.historical;
                historical.forEach(({ date, open, high, low, close, change }) => {
                    data.push(change >= 0 ? [new Date(date), high, open, close, low] : [new Date(date), low, open, close, high]);
                });
                this.setState({ data, loading: false});
            });

            /*backRequest.get(`/userstocks/${this.props.stockInfo.symbol}`).then(responce => {
                const stock = responce.data.data;
                this.setState({ stock });
            })*/
        }
    }

    handleInput = event => {
        this.setState({inputCount: event.target.value});
    };

    render() {
        const {
            symbol,
            count,
            profile: {
                image,
                companyName,
                price,
                description,
                changes,
                changesPercentage
            }
        } = (this.props.stock) ? this.props.stock : this.props.stockInfo;

        let { data, loading, inputCount }= this.state;


        return (
            <div className="stock-info">
                <div className="stock-info__title-box">
                    <img className="stock-info__img" src={image} alt={symbol}/>
                    <h1 className="stock-info__title">{companyName} | {symbol}</h1>
                    <div className="title-box__text">
                        <div className="title-box__bottom">
                            <p className="stock-info__price">{price}$</p>
                            <span className="stock__changes">{changes}</span>
                            <span className="stock__percentage">{changesPercentage}</span>
                            {count && <p className="stock__count">{count} items(s)</p>}
                           {/* {this.state.stock && this.state.stock.count && <p className="stock__count">{this.state.stock.count} items(s)</p>}*/}
                          {/*  <p className="stock__count">{this.context.windowedCount} items(s)</p>*/}
                        </div>
                    </div>
                </div>

                <div className="stock-info__content-box">
                    <p className="stock-info__profile">{description}</p>
                </div>
                <div className="stock-info__button-box">
                    <input
                        type='text'
                        value={this.state.inputCount}
                        onChange={this.handleInput}
                        placeholder="Enter stock(s) count..."
                    />
                    {Number.isNaN(Number(inputCount)) || !inputCount || inputCount==="0" || <p>{Number(inputCount)*price}$</p>}
                    <button
                        className="button button-sell"
                        onClick={this.context.setTransaction(
                            symbol,
                            Number(inputCount),
                            price,
                            "sell"
                        )}
                        disabled={Number.isNaN(Number(inputCount)) || !inputCount || inputCount==="0"}
                    >
                        Sell
                    </button>
                    <button className="button button-buy"
                            onClick={this.context.setTransaction(
                                symbol,
                                Number(inputCount),
                                price,
                                "buy"
                            )}
                            disabled={Number.isNaN(Number(inputCount)) || !inputCount || inputCount==="0"}
                    >
                        Buy
                    </button>
                </div>

                {loading &&
                <div className="loading">
                    <div className="obj"></div>
                    <div className="obj"></div>
                    <div className="obj"></div>
                    <div className="obj"></div>
                    <div className="obj"></div>
                    <div className="obj"></div>
                    <div className="obj"></div>
                    <div className="obj"></div>
                </div>
                }

                {data && !loading && <Chart
                    chartType="CandlestickChart"
                    width="90%"
                    height="300px"
                    data={data}
                    loader={<div>Loading Chart</div>}
                    options={{
                        /*animation: {
                            duration: 500,
                            easing: 'linear',
                            startup: true,
                        },*/
                        backgroundColor: "white",
                        candlestick: {
                            fallingColor: { strokeWidth: 0, fill: '#a52714' }, // red
                            risingColor: { strokeWidth: 0, fill: '#0f9d58' }, // green
                        },
                    }}
                    rootProps={{ 'data-testid': '3' }}
                    chartPackages={['corechart', 'controls']}
                    controls={[
                        {
                            controlType: 'ChartRangeFilter',
                            options: {
                                filterColumnIndex: 0,
                                ui: {
                                    chartType: 'LineChart',
                                    chartOptions: {
                                    /*    backgroundColor: "none",*/
                                        vAxis: { viewWindow: { min: 150, max: 200 } },
                                        width: 700,
                                        chartArea: { width: '90%', height: '40%' },
                                    },
                                    chartView: {
                                        columns: [0, 1]
                                    },
                                },
                            },
                            controlPosition: 'bottom',
                            controlWrapperParams: {
                                state: {
                                    range: { start: new Date(1997, 1, 9), end: new Date(2020, 2, 20) },
                                },
                            },

                        },
                    ]}

                />}

            </div>
        );
    }

}

export default StockInfo;
