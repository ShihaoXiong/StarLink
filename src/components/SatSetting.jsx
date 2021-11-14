import React, { Component } from 'react';
import { Form, InputNumber, Button } from 'antd';

class SatSettingForm extends Component {
	showSatellite = event => {
		event.preventDefault();
		this.props.form.validateFields((err, values) => {
			!err && this.props.onShow(values);
		});
	};

	render() {
		const { getFieldDecorator } = this.props.form;
		const formItemLayout = {
			labelCol: {
				xs: { span: 24 },
				sm: { span: 11 }
			},
			wrapperCol: {
				xs: { span: 24 },
				sm: { span: 13 }
			}
		};

		return (
			<Form {...formItemLayout} onSubmit={this.showSatellite} className='sat-setting'>
				<Form.Item label='Longitude(degrees)'>
					{getFieldDecorator('longitude', {
						rules: [{ required: true, message: 'Please input your Longitude' }],
						initialValue: 70
					})(<InputNumber placeholder='longitude' min={-180} max={180} style={{ width: '100%' }} />)}
				</Form.Item>

				<Form.Item label='Latitude(degrees)'>
					{getFieldDecorator('latitude', {
						rules: [{ required: true, message: 'Please input your Latitude' }],
						initialValue: -40
					})(<InputNumber placeholder='latitude' min={-90} max={90} style={{ width: '100%' }} />)}
				</Form.Item>

				<Form.Item label='Elevation(meters)'>
					{getFieldDecorator('elevation', {
						rules: [{ required: true, message: 'Please input your Elevation' }],
						initialValue: 100
					})(<InputNumber placeholder='elevation' min={-413} max={8850} style={{ width: '100%' }} />)}
				</Form.Item>

				<Form.Item label='Altitude(degrees)'>
					{getFieldDecorator('altitude', {
						rules: [{ required: true, message: 'Please input your Altitude' }],
						initialValue: 90
					})(<InputNumber placeholder='altitude' min={0} max={90} style={{ width: '100%' }} />)}
				</Form.Item>

				<Form.Item label='Duration(secs)'>
					{getFieldDecorator('duration', {
						rules: [{ required: true, message: 'Please input your Duration' }],
						initialValue: 10
					})(<InputNumber placeholder='duration' min={0} max={90} style={{ width: '100%' }} />)}
				</Form.Item>

				<Form.Item className='show-nearby'>
					<Button type='primary' htmlType='submit' style={{ textAlign: 'center' }}>
						Find Nearby Satellite
					</Button>
				</Form.Item>
			</Form>
		);
	}
}

const SatSetting = Form.create({ name: 'satellite-setting' })(SatSettingForm);
export default SatSetting;
