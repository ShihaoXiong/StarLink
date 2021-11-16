import React, { Component } from 'react';
import { feature } from 'topojson-client';
import { WORLD_MAP_URL } from '../constants';
import { geoKavrayskiy7 } from 'd3-geo-projection';
import http from '../service';
import { geoGraticule, geoPath } from 'd3-geo';
import { select as d3Select } from 'd3-selection';

const width = 960;
const height = 600;

class WorldMap extends Component {
	constructor() {
		super();
		this.refMap = React.createRef();
		this.refTrack = React.createRef();
	}

	componentDidMount() {
		http.get(WORLD_MAP_URL).then(res => {
			const land = feature(res, res.objects.countries).features;
			this.generateMap(land);
		});
	}

	generateMap(land) {
		const { current } = this.refMap;
		const projection = geoKavrayskiy7()
			.scale(170)
			.translate([width / 2, height / 2])
			.precision(0.1);

		const graticule = geoGraticule();
		const canvas = d3Select(current).attr('width', width).attr('height', height);

		const context = canvas.node().getContext('2d');
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
	}

	componentDidUpdate(preProps, preState, snapshot) {
		if (preProps.satData !== this.props.satData) {
		}
	}

	render() {
		return (
			<div className='map-box'>
				<canvas className='map' ref={this.refMap} />
				<canvas className='track' ref={this.refTrack} />
			</div>
		);
	}
}

export default WorldMap;
