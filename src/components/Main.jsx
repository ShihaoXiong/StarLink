import React, { Component } from 'react';
import { Row, Col } from 'antd';
import SatSetting from './SatSetting';
import SatelliteList from './SatelliteList';
import http from '../service';
import { NEARBY_SATELLITE, SAT_API_KEY, STARLINK_CATEGORY } from '../constants';

class Main extends Component {
	state = { satInfo: null, settings: null, isLoadingList: false };

	showNearbySatellite = settings => {
		this.setState({ settings });
		this.fetchSatellite(settings);
	};

	fetchSatellite = settings => {
		const { latitude, longitude, elevation, altitude } = settings;
		const url = `/api/${NEARBY_SATELLITE}/${latitude}/${longitude}/${elevation}/${altitude}/${STARLINK_CATEGORY}/&apiKey=${SAT_API_KEY}`;

		this.setState({ isLoadingList: true });

		http
			.get(url)
			.then(res => this.setState({ satInfo: res }))
			.finally(() => this.setState({ isLoadingList: false }));
	};

	render() {
		const { satInfo, isLoadingList } = this.state;

		return (
			<Row className='main'>
				<Col span={8} className='left-side'>
					<SatSetting onShow={this.showNearbySatellite} />
					<SatelliteList satInfo={satInfo} isLoad={isLoadingList} />
				</Col>
				<Col span={16} className='right-side'>
					right
				</Col>
			</Row>
		);
	}
}

export default Main;
