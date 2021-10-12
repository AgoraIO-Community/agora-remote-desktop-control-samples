import React, { FC, useEffect, useState } from 'react';
import { Affix, Button, Form, FormProps, Input, InputNumber, Modal, Select } from 'antd';
import { useHistory } from 'react-router-dom';
import { RDCRoleType } from 'agora-rdc-core';
import { SettingOutlined } from '@ant-design/icons';
import { joinSession, JoinSessionParams } from '../../api';
import { HostOptions, ControlledOptions } from '../../interfaces';
import { FRAME_RATES, RESOLUTION_BITRATE } from '../../constants';

const DEFAULT_HOST_OPTIONS: HostOptions = { mouseEventsThreshold: 30, keyboardEventsThreshold: 30, rtcSDK: 'web' };
const DEFAULT_CONTROLLED_OPTIONS: ControlledOptions = { resolutionBitrate: '1080p2000', rtcSDK: 'web', frameRate: 60 };

const Landing: FC = () => {
  const history = useHistory();
  const [visible, setVisible] = useState(false);
  const [role, setRole] = useState<RDCRoleType>();
  const [landingForm] = Form.useForm<JoinSessionParams>();
  const [hostForm] = Form.useForm<Partial<HostOptions>>();
  const [controlledForm] = Form.useForm<Partial<ControlledOptions>>();

  useEffect(
    () =>
      hostForm.setFieldsValue(
        JSON.parse(localStorage.getItem('RDC_HOST_OPTS') ?? JSON.stringify(DEFAULT_HOST_OPTIONS)),
      ),
    [hostForm],
  );

  useEffect(
    () =>
      controlledForm.setFieldsValue(
        JSON.parse(localStorage.getItem('RDC_CONTROLLED_OPTS') ?? JSON.stringify(DEFAULT_CONTROLLED_OPTIONS)),
      ),
    [controlledForm],
  );

  const handleValuesChange: FormProps<JoinSessionParams>['onValuesChange'] = (_changedValues, allValues) => {
    if (typeof allValues.role === 'undefined') {
      return;
    }
    setRole(allValues.role);
  };

  const handleFinish = async () => {
    const params = await landingForm.validateFields();
    const {
      data: { userId },
    } = await joinSession(params);
    if (role === RDCRoleType.HOST) {
      const opts = { ...DEFAULT_HOST_OPTIONS, ...hostForm.getFieldsValue() };
      history.push(`/host/${userId}?opts=${window.btoa(JSON.stringify(opts))}`);
    }
    if (role === RDCRoleType.CONTROLLED) {
      const opts = { ...DEFAULT_CONTROLLED_OPTIONS, ...controlledForm.getFieldsValue() };
      history.push(`/controlled/${userId}?opts=${window.btoa(JSON.stringify(opts))}`);
    }
  };

  const handleOptionsOk = async () => {
    if (role === RDCRoleType.HOST) {
      const opts = await hostForm.validateFields();
      localStorage.setItem('RDC_HOST_OPTS', JSON.stringify(opts));
    }
    if (role === RDCRoleType.CONTROLLED) {
      const opts = await controlledForm.validateFields();
      localStorage.setItem('RDC_CONTROLLED_OPTS', JSON.stringify(opts));
    }

    setVisible(false);
  };

  const handleOptionsCancel = () => {
    setVisible(false);
  };

  return (
    <>
      <Affix style={{ position: 'absolute', right: 10, top: 10 }}>
        <Button
          shape="circle"
          icon={<SettingOutlined />}
          type="dashed"
          onClick={() => setVisible(true)}
          disabled={typeof role === 'undefined'}
        />
      </Affix>
      <Modal
        title="RDC Options"
        visible={visible}
        closable={false}
        onCancel={handleOptionsCancel}
        onOk={handleOptionsOk}>
        <>
          {role === RDCRoleType.HOST ? (
            <Form labelCol={{ span: 12 }} form={hostForm}>
              <Form.Item label="RTC SDK" name="rtcSDK">
                <Select>
                  <Select.Option value="electron">agora-sdk-electron</Select.Option>
                  <Select.Option value="web">agora-rtc-sdk-ng</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="Mouse Events Threshold(ms)"
                name="mouseEventsThreshold"
                rules={[{ type: 'number', min: 0, max: 500, message: 'Mouse Events Threshold must be in 0 ~ 500' }]}>
                <InputNumber style={{ width: '100%' }} step={10} />
              </Form.Item>
              <Form.Item
                label="Keyboard Events Threshold(ms)"
                name="keyboardEventsThreshold"
                rules={[{ type: 'number', min: 0, max: 500, message: 'Mouse Events Threshold must be in 0 ~ 500' }]}>
                <InputNumber style={{ width: '100%' }} step={10} />
              </Form.Item>
            </Form>
          ) : null}
          {role === RDCRoleType.CONTROLLED ? (
            <Form labelCol={{ span: 10 }} form={controlledForm}>
              <Form.Item label="RTC SDK" name="rtcSDK">
                <Select>
                  <Select.Option value="electron">agora-sdk-electron</Select.Option>
                  <Select.Option value="web">agora-rtc-sdk-ng</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="Resolution and Bitrate" name="resolutionBitrate">
                <Select>
                  {Object.keys(RESOLUTION_BITRATE).map((key) => {
                    const { width, height, bitrate } = RESOLUTION_BITRATE[key];
                    return (
                      <Select.Option value={key} key={key}>
                        {width} x {height}, {bitrate} bps
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
              <Form.Item label="Framerate" name="frameRate">
                <Select>
                  {FRAME_RATES.map((rate) => (
                    <Select.Option value={rate} key={rate}>
                      {rate} fps
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          ) : null}
        </>
      </Modal>
      <Form
        form={landingForm}
        style={{ marginTop: 160 }}
        name="landing"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 8 }}
        onValuesChange={handleValuesChange}
        onFinish={handleFinish}>
        <Form.Item label="Role" name="role" rules={[{ required: true, message: 'Please select role!' }]}>
          <Select>
            <Select.Option value={RDCRoleType.HOST}>Host</Select.Option>
            <Select.Option value={RDCRoleType.CONTROLLED}>Controlled</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Channel" name="channel" rules={[{ required: true, message: 'Please input channel!' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please input your name!' }]}>
          <Input />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 8 }}>
          <Button type="primary" htmlType="submit" block>
            JOIN
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default Landing;
