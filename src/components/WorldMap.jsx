import React, { Component } from 'react';
import { feature } from 'topojson-client';
import { WORLD_MAP_URL } from '../constants';
import { geoKavrayskiy7 } from 'd3-geo-projection';
import http from '../service';
import { geoGraticule, geoPath } from 'd3-geo';
import { select as d3Select } from 'd3-selection';
import { SATELLITE_POSITION_URL, SAT_API_KEY } from '../constants';
import * as d3Scale from 'd3-scale';
import { timeFormat as d3TimeFormat } from 'd3-time-format';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { Spin } from 'antd';

const width = 960;
const height = 600;

class WorldMap extends Component {
	constructor() {
		super();
		this.refMap = React.createRef();
		this.refTrack = React.createRef();
		this.map = null;
		this.state = { isLoading: false, isDrawing: false };
		this.color = d3Scale.scaleOrdinal(schemeCategory10);
	}

	componentDidMount() {
		http.get(WORLD_MAP_URL).then(res => {
			const land = feature(res, res.objects.countries).features;
			this.generateMap(land);
		});
	}

	generateMap(land) {
		const { current } = this.refMap;
		const { current: currentTrack } = this.refTrack;
		const projection = geoKavrayskiy7()
			.scale(170)
			.translate([width / 2, height / 2])
			.precision(0.1);

		const graticule = geoGraticule();
		const canvas = d3Select(current).attr('width', width).attr('height', height);
		const canvasTrack = d3Select(currentTrack).attr('width', width).attr('height', height);

		const context = canvas.node().getContext('2d');
		const contextTrack = canvasTrack.node().getContext('2d');
		const path = geoPath().projection(projection).context(context);

		land.forEach(ele => {
			context.fillStyle = '#B3DDEF';
			context.strokeStyle = '#000';
			context.globalAlpha = 0.7;
			context.beginPath();
			path(ele);
			context.fill();
			context.stroke();

			context.strokeStyle = 'rgba(220, 220, 220, 0.1)';
			context.beginPath();
			path(graticule());
			context.lineWidth = 0.1;
			context.stroke();

			context.beginPath();
			context.lineWidth = 0.5;
			path(graticule.outline());
			context.stroke();
		});

		this.map = { projection, graticule, context, contextTrack };
	}

	componentDidUpdate(preProps, preState, snapshot) {
		if (preProps.satData !== this.props.satData) {
			const { latitude, longitude, elevation, duration } = this.props.observerData;
			const endTime = duration * 60;

			this.setState({ isLoading: true });
			const urls = this.props.satData.map(sat => {
				const { satid } = sat;
				const url = `/api/${SATELLITE_POSITION_URL}/${satid}/${latitude}/${longitude}/${elevation}/${endTime}/&apiKey=${SAT_API_KEY}`;
				return http.get(url);
			});

			Promise.all(urls)
				.then(res => {
					this.setState({ isLoading: false, isDrawing: true });
					if (!preState.isDrawing) {
						this.track(res);
					} else {
						const oHint = document.getElementsByClassName('hint')[0];
						oHint.innerHTML = 'Please wait for these satellite animation to finish before selection new ones!';
					}
				})
				.finally(() => this.setState({ isLoading: false, isDrawing: false }));
		}
	}

	track = data => {
		if (!data[0].hasOwnProperty('positions')) {
			throw new Error('no position');
		}

		const len = data[0].positions.length;
		const { contextTrack } = this.map;
		const now = new Date();
		let i = 0;
		let timer = setInterval(() => {
			const ct = new Date();
			const timePassed = i === 0 ? 0 : ct - now;
			const time = new Date(now.getTime() + 60 * timePassed);

			contextTrack.clearRect(0, 0, width, height);
			contextTrack.font = 'bold 14px sans-serif';
			contextTrack.fillStyle = '#333';
			contextTrack.textAlign = 'center';
			contextTrack.fillText(d3TimeFormat(time), width / 2, 10);

			if (i >= len) {
				clearInterval(timer);
				this.setState({ isDrawing: false });
				const oHint = document.getElementsByClassName('hint')[0];
				oHint.innerHTML = '';
				return;
			}

			data.forEach(sat => {
				const { info, positions } = sat;
				this.drawSat(info, positions[i]);
			});

			i += 60;
		}, 1000);
	};

	drawSat = (sat, pos) => {
		const { satlongitude, satlatitude } = pos;

		if (!satlongitude || !satlatitude) return;

		const { satname } = sat;
		const nameWithNumber = satname.match(/\d+/g).join('');

		const { projection, contextTrack } = this.map;
		const xy = projection([satlongitude, satlatitude]);

		contextTrack.fillStyle = this.color(nameWithNumber);
		contextTrack.beginPath();
		contextTrack.arc(xy[0], xy[1], 4, 0, 2 * Math.PI);
		contextTrack.fill();

		contextTrack.font = 'bold 11px sans-serif';
		contextTrack.textAlign = 'center';
		contextTrack.fillText(nameWithNumber, xy[0], xy[1] + 14);
	};

	render() {
		const { isLoading } = this.state;
		return (
			<div className='map-box'>
				{isLoading ? (
					<div className='spinner'>
						<Spin tip='Loading...' size='large' />
					</div>
				) : null}
				<canvas className='map' ref={this.refMap} />
				<canvas className='track' ref={this.refTrack} />
				<div className='hint'></div>
			</div>
		);
	}
}

export default WorldMap;
