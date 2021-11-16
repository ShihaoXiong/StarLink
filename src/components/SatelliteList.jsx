import React, { Component } from 'react';
import { Button, List, Avatar, Checkbox, Spin } from 'antd';
import satellite from '../assets/images/satellite.svg';

class SatelliteList extends Component {
	state = { selected: [] };

	handleChange = e => {
		const { dataInfo, checked } = e.target;
		const { selected } = this.state;
		const list = this.addOrRemove(dataInfo, checked, selected);
		this.setState({ selected: list });
	};

	addOrRemove = (item, status, list) => {
		const found = list.some(sat => sat.satid === item.satid);

		if (status && !found) {
			list = [...list, item];
		}

		if (!status && found) {
			list = list.filter(entry => {
				return entry.satid !== item.satid;
			});
		}

		return list;
	};

	onShowSatMap = () => this.props.onShowMap(this.state.selected);

	render() {
		const satList = this.props.satInfo?.above ?? [];

		return (
			<div className='sat-list-box'>
				<div className='btn-container'>
					<Button className='sat-list-btn' size='large' type='primary' onClick={this.onShowSatMap}>
						Track on the map
					</Button>
				</div>
				<hr />
				{this.props.isLoad ? (
					<div className='spin-box'>
						<Spin tip='Loading...' size='large' />
					</div>
				) : (
					<List
						className='sat-list'
						itemLayout='horizontal'
						dataSource={satList}
						renderItem={item => (
							<List.Item actions={[<Checkbox dataInfo={item} onChange={this.handleChange} />]}>
								<List.Item.Meta
									avatar={<Avatar src={satellite} size={50} />}
									title={<p>{item.satname}</p>}
									description={`Launch Date: ${item.launchDate}`}
								/>
							</List.Item>
						)}
					/>
				)}
			</div>
		);
	}
}

export default SatelliteList;
