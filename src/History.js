import React, { useEffect, useState } from 'react';
import {
	Switch,
	Route,
	Link,
	useRouteMatch,
	useParams
} from "react-router-dom";
import { Dropdown } from 'react-bootstrap';
import { Chart, Line } from 'react-chartjs-2';
import { addDays, format as dateFormat } from 'date-fns';
import { DateRange } from 'react-date-range';

import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

export function History() {
	let match = useRouteMatch();

	return (
		<>
			<h2>Rate Histories</h2>

			<p>Select a date range and click <strong>Check History</strong> for a currency to see rate history</p>

			<Switch>
				<Route path={`${match.path}/:start_at/:end_at/:currencyID`}>
					<HistorySelector />
					<HistoryRates />
				</Route>
				<Route path={`${match.path}/:currencyID`}>
					<HistorySelector />
					<HistoryRates />
				</Route>
				<Route path={match.path}>
					<HistorySelector />
					<HistoryRates />
				</Route>
			</Switch>
		</>
	)
}

function HistorySelector() {
	let {start_at, end_at} = useParams();

	const [error, setError] = useState(null);
	const [isLoaded, setIsLoaded] = useState(false);
	const [currencies, setCurrencies] = useState([]);
	const [dateRange, setDateRange] = useState([
		{
			startDate: addDays(new Date(), -7),
			endDate: new Date(),
			key: 'selection'
		}
	]);

	useEffect(() => {
		if (start_at && end_at)
			setDateRange([
				{
					startDate: new Date(start_at),
					endDate: new Date(end_at),
					key: 'selection'
				}
			]);
	}, [start_at, end_at]);

	useEffect(() => {
		fetch('https://api.exchangeratesapi.io/latest?base=USD')
			.then(res => res.json())
			.then(
				(result) => {
					setIsLoaded(true);
					let apiCurrenies = [];
					Object.keys(result.rates).map((key) => {
						apiCurrenies.push(key)

						return true;
					})
					setCurrencies(apiCurrenies);
				},
				(error) => {
					setIsLoaded(true);
					setError(error);
				}
			)
	}, [])

	if (error) {
		return <div>Error: {error.message}</div>;
	} else if (!isLoaded) {
		return <div>Loading...</div>;
	} else {
		return (
			<div className="row">
				<div class="col-12 col-md-6 text-md-right">
					<DateRange
						editableDateInputs={true}
						onChange={item => setDateRange([item.selection])}
						moveRangeOnFirstSelection={false}
						ranges={dateRange}
						maxDate={new Date()}
					/>
				</div>

				<div class="col-12 col-md-6 text-md-left">
					<Dropdown>
						<Dropdown.Toggle variant="success" id="dropdown-basic">
							Check History
						</Dropdown.Toggle>

						<Dropdown.Menu>
							{currencies.map((currency) => (
								<Dropdown.Item key={currency} href={`/history/${dateFormat(dateRange[0].startDate, 'yyyy-MM-dd')}/${dateFormat(dateRange[0].endDate, 'yyyy-MM-dd')}/${currency}`} ><strong>{currency}</strong></Dropdown.Item>
							))}
						</Dropdown.Menu>
					</Dropdown>
				</div>
			</div>
		);
	}
}

function HistoryRates() {
	const [error, setError] = useState(null);
	const [isLoaded, setIsLoaded] = useState(false);
	const [results, setResults] = useState([]);
	const [currency, setCurrency] = useState('EUR');
	const [symbols, setSymbols] = useState([]);
	const [histories, setHistories] = useState([]);
	const [startAt, setStartAt] = useState(dateFormat(addDays(new Date(), -7), 'yyyy-MM-dd'));
	const [endAt, setEndAt] = useState(dateFormat(new Date(), 'yyyy-MM-dd'));

	Chart.defaults.global.defaultFontColor = 'black';

	let {start_at, end_at, currencyID} = useParams();

	useEffect(() => {
		if (currencyID)
			setCurrency(currencyID);
	}, [currencyID]);

	useEffect(() => {
		if (start_at)
			setStartAt(start_at);
	}, [start_at]);

	useEffect(() => {
		if (end_at)
			setEndAt(end_at);
	}, [end_at]);

	useEffect(() => {
		fetch('https://api.exchangeratesapi.io/history?start_at=' + startAt + '&end_at=' + endAt + '&base=' + currency)
			.then(res => res.json())
			.then(
				(result) => {
					setHistories([]);
					setSymbols([]);

					if (result.rates) {
						const ordered = Object.keys(result.rates).sort().reduce(
							(obj, key) => {
								obj[key] = result.rates[key];
								return obj;
							},
							{}
						);

						result.rates = ordered;
					}

					setIsLoaded(true);
					setResults(result);

					let apiHistories = [], apiSymbols = [];
					if (result['rates']) {
						Object.keys(result['rates']).map((key) => {
							Object.keys(result['rates'][key]).map((key2) => {
								let found = apiSymbols.findIndex(element => element === key2);
								if (found > -1) {
									apiHistories[found].push({date: key, rate: result['rates'][key][key2]});
								} else {
									apiSymbols.push(key2);
									apiHistories.push([{date: key, rate: result['rates'][key][key2]}]);
								}

								return true;
							});

							return true;
						});

						setHistories(apiHistories);
						setSymbols(apiSymbols);
					}
				},
				(error) => {
					setIsLoaded(true);
					setError(error);
				}
			)
	}, [currency, startAt, endAt])

	if (error) {
		return <div>Error: {error.message}</div>;
	} else if (!isLoaded) {
		return <div>Loading...</div>;
	} else {
		let dataHistories = [];
		if (results['rates']) {
			Object.keys(symbols).map((key) => {
				let dataLabels = [], dataData = [];
				if (histories[key]) {
					histories[key].map((daily) => {
						dataLabels.push(daily.date);
						dataData.push(daily.rate);

						return true;
					})
				}

				dataHistories.push({
					datasets: [
						{
							data: dataData,
							label: 'FX Rate',
							backgroundColor: 'rgb(255, 99, 132)',
							borderColor: '#333',
							borderWidth: 1,
							fill: false,
						}
					],
					labels: dataLabels
				})

				return true;
			})
		}

		return (
			<div className="row mt-3">
				<div className="col-4 col-md-2 text-right">
					<div style={{position: 'sticky', top: 15}}>
						<h4><strong>{currency}</strong> 👉🏻</h4>
						<p><Link to={`/latest/${currency}`} className="text-dark border-bottom border-dark pb-2">Latest Rate</Link></p>
					</div>
				</div>
				<div className="col-8 col-md-10">
					<ul className="list-unstyled text-left">
					{(results['rates']) && Object.keys(symbols).map((key) => (
						<li key={key} className="row mb-4">
							<div className="col-4 col-md-2">
								<div style={{position: 'sticky', top: 15}}>
									<h4><strong>{symbols[key]}</strong></h4>
									<ul className="list-unstyled">
										<li className="mb-3"><Link to={`/latest/${symbols[key]}`} className="text-dark border-bottom border-dark pb-2">Latest Rate</Link></li>
										<li className="mb-3"><Link to={`/history/${startAt}/${endAt}/${symbols[key]}`} className="text-dark border-bottom border-dark pb-2">Rate History</Link></li>
									</ul>
								</div>
							</div>
							<div className="col-8 col-md-10">
								<div className="d-inline-block">
								<Line
									data={dataHistories[key]}
									width={800}
									height={300}
									options={{ maintainAspectRatio: true, responsive: true }}
									/>
									<div className="border-bottom border-dark pt-2"></div>
								</div>
							</div>
						</li>
					))}
					</ul>
				</div>
			</div>
		);
	}
}
