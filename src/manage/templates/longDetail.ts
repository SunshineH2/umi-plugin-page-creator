/*
 * @文件描述: 生成长详情页面
 * @公司: thundersdata
 * @作者: 陈杰
 * @Date: 2020-05-08 16:05:30
 * @LastEditors: 黄姗姗
 * @LastEditTime: 2020-05-25 09:47:49
 */
import { transformFormItemLines } from './util';
import { CardItemProps } from '../../../interfaces/common';

export interface Payload {
  cards: CardItemProps[];
  initialFetch?: string[];
}

export default function generateLongFormCode(payload: Payload): string {
  if (payload && payload.cards) {
    const { cards = [], initialFetch } = payload;

    const code = `
      import React, { useCallback } from 'react';
      import {
        Form,
        Card,
        Row,
        Col,
        Spin,
      } from 'antd';
      import Title from '@/components/Title';
      import DetailValue from '@/components/DetailValue';
      import { useRequest, history } from 'umi';

      const colLayout = {
        lg: {
          span: 8
        },
        md: {
          span: 12
        },
        sm: {
          span: 24
        }
      }

      export default () => {
        const [form] = Form.useForm();
        const { id } = history.location.query;

        const fetchDetail = useCallback(async () => {
          if (id) {
            const result = await API.${initialFetch && initialFetch.length === 3 ? `${initialFetch[0]}.${initialFetch[1]}.${
              initialFetch[2].split('-')[0]
            }` : 'recruitment.person.getPerson'}.fetch(
              { personCode: id },
            );
            // 这里可以做数据转换操作
            const values = {
              ...result
            }
            form.setFieldsValue(values);
          }
        }, [id]);

        const { loading } = useRequest(fetchDetail, {
          refreshDeps: [fetchDetail],
        });

        return (
          <Spin spinning={loading}>
            <Form form={form} layout="vertical">
              ${cards
                .map(card => {
                  const { title = '', formItems = [] } = card;
                  const cols = 3;
                  // 把formItems分成3列
                  const formItemLines = transformFormItemLines(formItems, cols);

                  return `
                  <Card title={<Title text="${title}" />} style={{ marginBottom: 16 }}>
                    ${formItemLines
                      .map(line => {
                        return `
                        <Row gutter={16}>
                          ${line
                            .map(formItem => {
                              const { label, name, type, ...restProps } = formItem;

                              return `
                              <Col {...colLayout}>
                                <Form.Item
                                  label="${formItem.label}"
                                  name="${formItem.name}"
                                >
                                  <DetailValue ${formItem.detailItemType && formItem.detailItemType !== 'default' ? `type="${formItem.detailItemType}"` : ''} />
                                </Form.Item>
                              </Col>
                            `;
                            })
                            .join('')}
                        </Row>
                      `;
                      })
                      .join('')}
                  </Card>
                `;
                })
                .join('')}
            </Form>
          </Spin>
        );
      };
    `;
    return code;
  }
  return '';
}
