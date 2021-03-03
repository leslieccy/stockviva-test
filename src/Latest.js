import React, { useEffect, useState } from 'react';
import {
	Switch,
	Route,
	Link,
	useRouteMatch,
	useParams
} from "react-router-dom";

export function Latest() {
	let match = useRouteMatch();

	return (
		<>
			<h2>Latest Rates</h2>
			<p>Click on currency for latest rate</p>
			<Switch>
				<Route path={`${match.path}/:currencyID`}>
					<LatestRates />
				</Route>
				<Route path={match.path}>
					<LatestRates />
				</Route>
			</Switch>
		</>
	)
}

function LatestRates() {
	const [error, setError] = useState(null);
	const [isLoaded, setIsLoaded] = useState(false);
	const [results, setResults] = useState([]);
	const [currency, setCurrency] = useState('EUR');

	let {currencyID} = useParams();

	useEffect(() => {
		if (currencyID)
			setCurrency(currencyID);
	}, [currencyID]);

	useEffect(() => {
		fetch('https://api.exchangeratesapi.io/latest?base=' + currency)
			.then(res => res.json())
			.then(
				(result) => {
					setIsLoaded(true);
					setResults(result);
				},
				(error) => {
					setIsLoaded(true);
					setError(error);
				}
			)
	}, [currency])

	if (error) {
		return <div>Error: {error.message}</div>;
	} else if (!isLoaded) {
		return <div>Loading...</div>;
	} else {
		return (
			<div className="row mt-3">
				<div className="col-4 col-md-5 text-right">
					<h4 style={{position: 'sticky', top: 15}}><strong>{currency}</strong> 👉🏻</h4>
				</div>
				<div className="col-8 col-md-7">
					<ul className="list-unstyled text-left">
					{(results['rates']) && Object.keys(results['rates']).map((key) => (
						<li key={key} className="row mb-4">
							<div className="col-4 col-md-2"><Link to={`/latest/${key}`} className="text-dark border-bottom border-dark pb-2"><strong>{key}</strong></Link></div>
							<div className="col-8 col-md-10">
								<div className="d-inline-block">
									{results['rates'][key].toString()}
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
