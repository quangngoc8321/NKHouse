import { useMutation, useQuery } from "@apollo/react-hooks";
import {
	Button, Card, Col, Divider,
	Drawer, Form, Icon, Input, InputNumber, Layout, Menu, Modal, Popconfirm, Radio, Result, Row, Table, Tabs, Typography, Upload
} from "antd";
import "antd/dist/antd";
import { FormComponentProps } from "antd/lib/form";
import { UploadChangeParam } from "antd/lib/upload";
import React, { FormEvent, useState } from "react";
// import Axios from "axios";
import { Link, Redirect } from "react-router-dom";
import { ListingsFilter, ListingType } from "../../../lib/graphql/globalTypes";
import {
	DELETE_LISTING,
	HOST_LISTING,
	UPDATE_LISTING
} from "../../../lib/graphql/mutation";
import {
	DeleteListing as DeleteListingData,
	DeleteListingVariables
} from "../../../lib/graphql/mutation/DeleteListing/__generated__/DeleteListing";
import {
	HostListing as HostListingData,
	HostListingVariables
} from "../../../lib/graphql/mutation/HostListing/__generated__/HostListing";
import {
	UpdateListing as UpdateListingData,
	UpdateListingVariables
} from "../../../lib/graphql/mutation/UpdateListing/__generated__/UpdateListing";
import { LISTINGS } from "../../../lib/graphql/queries";
import {
	Listings as ListingsData, ListingsVariables
} from "../../../lib/graphql/queries/Listings/__generated__/Listings";
import { Viewer } from "../../../lib/types";
import {
	displayErrorNotification,
	displaySuccessNotification,
	iconColor
} from "../../../lib/utils";
import { Slider } from "../components";


interface Props {
	viewer: Viewer;
}

const { Footer, Content } = Layout;
const { Text, Title } = Typography;
const { TabPane } = Tabs;
const { SubMenu } = Menu;
const { Search } = Input;
const { Item } = Form;

const PAGE_LIMIT = 100000;

export const ListListings = ({ viewer, form }: Props & FormComponentProps) => {
	const [collapsed, setCollapsed] = useState(false);
	const [filter, setFilter] = useState(ListingsFilter.PRICE_LOW_TO_HIGH);
	const [page, setPage] = useState(1);
	const [modalvisible, setmodalvisible] = useState(false);
	const [drawervisible, setdrawervisible] = useState(false);
	const [imageLoading, setImageLoading] = useState(false);
	const [imageBase64Value, setImageBase64Value] = useState<string | null>(null);
	const [selectedRow, setSelectedRow] = useState<any>();
	const [updatelistingid, setUpdateListingId] = useState("");
	const [recordRow, setRecordRow] = useState<any>();
	const [tabledata, setTableData] = useState<any>();

	const showModal = () => {
		setmodalvisible(true);
	};

	const showDrawer = (id: string, record: any) => {
		setdrawervisible(true);
		setUpdateListingId(id);
		setRecordRow(record);
		console.log(id);
		console.log(record);
	};

	const handleCancel = (e: any) => {
		console.log(e);
		setmodalvisible(false);
	};

	const onClose = () => {
		setdrawervisible(false);
	};

	const { loading, data } = useQuery<ListingsData, ListingsVariables>(
		LISTINGS,
		{
			variables: {
				filter: ListingsFilter.PRICE_HIGH_TO_LOW,
				limit: PAGE_LIMIT,
				page,
			},
		}
	);

	const [
		hostListing,
		{ loading: HostListingloading, data: HostListingdata },
	] = useMutation<HostListingData, HostListingVariables>(HOST_LISTING, {
		onCompleted: () => {
			displaySuccessNotification(
				"B???n ???? t???o danh s??ch cho thu?? nh??/ph??ng th??nh c??ng!"
			);
		},
		onError: () => {
			displayErrorNotification(
				"Xin l???i ! hi???n ch??ng t??i kh??ng th??? gi??p b???n t???o danh s??ch nh??/ph??ng. Xin h??y th??? l???i sau"
			);
		},
	});

	const [
		updateListing,
		{ loading: UpdateListingloading, data: UpdateListingdata },
	] = useMutation<UpdateListingData, UpdateListingVariables>(UPDATE_LISTING, {
		onCompleted: () => {
			displaySuccessNotification(
				"B???n ???? update danh s??ch cho thu?? nh??/ph??ng th??nh c??ng!"
			);
		},
		onError: () => {
			displayErrorNotification(
				"Xin l???i ! hi???n ch??ng t??i kh??ng th??? gi??p b???n update danh s??ch nh??/ph??ng. Xin h??y th??? l???i sau"
			);
		},
	});

	const [
		deleteListing,
		{ loading: DeleteListingloading, data: DeleteListingdata },
	] = useMutation<DeleteListingData, DeleteListingVariables>(DELETE_LISTING, {
		onCompleted: () => {
			displaySuccessNotification(
				"B???n ???? x??a danh s??ch cho thu?? nh??/ph??ng th??nh c??ng!"
			);
		},
		onError: () => {
			displayErrorNotification(
				"Xin l???i ! hi???n ch??ng t??i kh??ng th??? gi??p b???n x??a danh s??ch nh??/ph??ng. Xin h??y th??? l???i sau"
			);
		},
	});

	if (loading) {
		console.log("loading");
	}

	const listings = data ? data.listings : null;
	const recordRows = recordRow ? recordRow : null;

	const handleImageUpload = (info: UploadChangeParam) => {
		const { file } = info;

		if (file.status === "uploading") {
			setImageLoading(true);
			return;
		}

		if (file.status === "done" && file.originFileObj) {
			getBase64Value(file.originFileObj, (imageBase64Value) => {
				setImageBase64Value(imageBase64Value);
				setImageLoading(false);
			});
		}
	};

	const handleHostListing = (evt: FormEvent) => {
		evt.preventDefault();

		form.validateFields((err, values) => {
			if (err) {
				displayErrorNotification("Xin h??y ??i???n ?????y ????? c??c y??u c???u!");
				return;
			}

			const fullAddress = `${values.address}, ${values.city}, ${values.state}, ${values.postalCode}`;

			const input = {
				...values,
				address: fullAddress,
				image: imageBase64Value,
				price: values.price,
			};
			delete input.city;
			delete input.state;
			delete input.postalCode;

			hostListing({
				variables: {
					input,
				},
			});
		});
	};

	const handleUpdateListing = (evt: FormEvent) => {
		evt.preventDefault();

		form.validateFields((err, values) => {
			if (err) {
				displayErrorNotification("Xin h??y ??i???n ?????y ????? c??c y??u c???u!");
				return;
			}

			const fullAddress = `${values.address}, ${values.city}, ${values.state}, ${values.postalCode}`;

			const input = {
				...values,
				address: fullAddress,
				image: imageBase64Value,
				price: values.price,
			};
			delete input.city;
			delete input.state;
			delete input.postalCode;

			updateListing({
				variables: {
					id: updatelistingid,
					input,
				},
			});
		});
	};

	const handleDeleteListing = async (id: string) => {
		await deleteListing({ variables: { id } });
	};

	const handleSearch = (shareKey: any, data: any) => {
		setTableData(
			data.filter((datarow: any) =>
				JSON.stringify(datarow)
					.toLocaleLowerCase()
					.includes(shareKey.toLocaleLowerCase())
			)
		);
		console.log(tabledata);
		console.log(shareKey);
		
		
	};

	const beforeImageUpload = (file: File) => {
		const fileIsValidImage =
			file.type === "image/jpeg" || file.type === "image/png";
		const fileIsValidSize = file.size / 1024 / 1024 < 1;

		if (!fileIsValidImage) {
			displayErrorNotification("B???n ch??? c?? th??? t???i l??n c??c t???p JPG ho???c PNG!");
			return false;
		}

		if (!fileIsValidSize) {
			displayErrorNotification(
				"B???n ch??? c?? th??? t???i l??n c??c t???p h??nh ???nh c?? k??ch th?????c d?????i 1MB!"
			);
			return false;
		}

		return fileIsValidImage && fileIsValidSize;
	};

	const getBase64Value = (
		img: File | Blob,
		callback: (imageBase64Value: string) => void
	) => {
		const reader = new FileReader();
		reader.readAsDataURL(img);
		reader.onload = () => {
			callback(reader.result as string);
		};
	};

	const tablecolumns = [
		{
			title: "ID",
			dataIndex: "id",
			key: "id",
		},
		{
			title: "Title",
			dataIndex: "title",
			key: "title",
		},
		{
			title: "Num Of Guests",
			dataIndex: "numOfGuests",
			key: "numOfGuests",
			sorter: (a: any, b: any) => a.numOfGuests - b.numOfGuests,
		},
		{
			title: "Address",
			dataIndex: "address",
			key: "address",
		},
		{
			title: "Price",
			key: "price",
			dataIndex: "price",
			sorter: (a: any, b: any) => a.price - b.price,
		},
		{
			title: "Action",
			dataIndex: "action",
			render: (text: any, record: any) => (
				<span>
					<Popconfirm
						title="Sure to delete?"
						onConfirm={() => handleDeleteListing(record.id)}
					>
						<a>Delete</a>
					</Popconfirm>
					<Divider type="vertical" />
					<Popconfirm
						title="Sure to edit?"
						onConfirm={() => showDrawer(record.id, record)}
					>
						<a>Edit</a>
					</Popconfirm>
				</span>
			),
		},
	];

	const { getFieldDecorator } = form;

	// rowSelection object indicates the need for row selection
	const rowSelection = {
		onChange: (selectedRowKeys: any, selectedRows: any) => {
			setSelectedRow(selectedRows);
			console.log(
				`selectedRowKeys: ${selectedRowKeys}`,
				"selectedRows: ",
				selectedRows
			);
		},
		getCheckboxProps: (record: any) => ({
			disabled: record.name === "Disabled User", // Column configuration not to be checked
			name: record.name,
		}),
	};

	const CardlistingsElement =
		listings && listings.result.length ? (
			<div className="table">
				<Row gutter={16}>
					<Col span={8} style={{ alignItems: "center" }}>
						<Card title="Total Listings" bordered={false}>
							<Text strong>{listings.total}</Text>
						</Card>
					</Col>
				</Row>
			</div>
		) : null;

	const sliderElement = <Slider viewer={viewer} />;

	const listingsSectionElement =
		listings && listings.result.length ? (
			<div className="table">
				{" "}
				<Button
					type="primary"
					onClick={showModal}
					className="user-profile__details-cta"
					style={{ marginBottom: 16 }}
				>
					<Icon type="plus" />
					New Listing
				</Button>
				<Divider type="vertical" />
				<Button
					type="primary"
					onClick={() => {
						selectedRow
							? handleDeleteListing(selectedRow.id)
							: console.log("Choose a row");
					}}
					style={{ marginBottom: 16, paddingLeft: 10 }}
				>
					Delete Listings
				</Button>
				<Search
					placeholder="T??m VietNam"
					enterButton
					style={{ width: "40%", paddingLeft: 10 }}
					onChange={(e) => {
						handleSearch(e.target.value, listings.result);
					}}
					defaultValue=" "
					allowClear={true}
				/>
				<Modal
					title="Add New Listing"
					visible={modalvisible}
					onOk={handleHostListing}
					onCancel={handleCancel}
				>
					<Content className="host-content">
				<Form layout="vertical">
					<Item label="Lo???i Nh??/Ph??ng">
						{getFieldDecorator("type", {
							rules: [
								{
									required: true,
									message: "Xin h??y ch???n lo???i nh??/ph??ng!",
								},
							],
						})(
							<Radio.Group>
								<Radio.Button value={ListingType.APARTMENT}>
									<Icon type="bank" style={{ color: iconColor }} />{" "}
									<span>Chung c??</span>
								</Radio.Button>
								<Radio.Button value={ListingType.HOUSE}>
									<Icon type="home" style={{ color: iconColor }} />{" "}
									<span>Nh??</span>
								</Radio.Button>
							</Radio.Group>
						)}
					</Item>

					<Item label="S??? kh??ch t???i ??a">
						{getFieldDecorator("numOfGuests", {
							rules: [
								{
									required: true,
									message: "Xin h??y nh???p s??? kh??ch t???i ??a c???a nh??/ph??ng !",
								},
							],
						})(<InputNumber min={1} placeholder="4" />)}
					</Item>

					<Item label="Ti??u ?????" extra="S??? k?? t??? t???i ??a l?? 45">
						{getFieldDecorator("title", {
							rules: [
								{
									required: true,
									message: "Xin h??y ??i???n ti??u ????? cho nh??/ph??ng c???a b???n!",
								},
							],
						})(
							<Input
								maxLength={45}
								placeholder="Vung Tau Melody,Seaview Apartment"
							/>
						)}
					</Item>

					<Item label="Mi??u t??? v??? nh??/ph??ng" extra="S??? k?? t??? t???i ??a l?? 400">
						{getFieldDecorator("description", {
							rules: [
								{
									required: true,
									message: "Xin h??y ??i???n mi??u t??? cho nh??/ph??ng c???a b???n!",
								},
							],
						})(
							<Input.TextArea
								rows={3}
								maxLength={400}
								placeholder="C??n ph??ng tr??? n??y n???m tr??n t???ng 24, block A c???a V??ng T??u Melody, l?? m???t trong nh???ng v??? tr?? ?????p g???n bi???n ??? trung t??m TP V??ng T??u.This apartment room is located on the 24th floor, block A of Vung Tau Melody, which is one of the beautiful locations near the beach in the center of Vung Tau City."
							/>
						)}
					</Item>

					<Item label="?????a ch???">
						{getFieldDecorator("address", {
							rules: [
								{
									required: true,
									message: "Xin h??y ??i???n ?????a ch??? nh??/ph??ng c???a b???n!",
								},
							],
						})(<Input placeholder="Th??nh ph??? V??ng T??u" />)}
					</Item>

					<Item label="Th??nh Ph???/X??">
						{getFieldDecorator("city", {
							rules: [
								{
									required: true,
									message:
										"Xin h??y ??i???n t??n th??nh ph??? (khu v???c) c???a nh??/ph??ng c???a b???n!",
								},
							],
						})(<Input placeholder="B?? R???a - V??ng T??u" />)}
					</Item>

					<Item label="T???nh">
						{getFieldDecorator("state", {
							rules: [
								{
									required: true,
									message: "Xin h??y ??i???n t??n T???nh c???a nh??/ph??ng c???a b???n!",
								},
							],
						})(<Input placeholder="V??ng T??u" />)}
					</Item>

					<Item label="M?? Zip/B??u ??i???n">
						{getFieldDecorator("postalCode", {
							rules: [
								{
									required: true,
									message:
										"Xin h??y ??i???n m?? zip (ho???c m?? b??u ??i???n) c???a nh??/ph??ng b???n!",
								},
							],
						})(
							<Input placeholder="Vui l??ng nh???p m?? Zip cho nh??/ph??ng c???a b???n!" />
						)}
					</Item>

					<Item
						label="H??nh ???nh"
						extra="H??nh ???nh ph???i c?? k??ch th?????c d?????i 1MB v?? thu???c lo???i JPG ho???c PNG"
					>
						<div className="host__form-image-upload">
							{getFieldDecorator("image", {
								rules: [
									{
										required: true,
										message: "Xin h??y cung c???p h??nh ???nh cho nh??/ph??ng c???a b???n",
									},
								],
							})(
								<Upload
									name="image"
									listType="picture-card"
									action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
									showUploadList={false}
									beforeUpload={beforeImageUpload}
									onChange={handleImageUpload}
								>
									{imageBase64Value ? (
										<img src={imageBase64Value} alt="Listing" />
									) : (
										<div>
											<Icon type={imageLoading ? "loading" : "plus"} />
											<div className="ant-upload-text">T???i l??n</div>
										</div>
									)}
								</Upload>
							)}
						</div>
					</Item>

					<Item label="Gi??" extra="T???t c??? t??nh b???ng $/ng??y">
						{getFieldDecorator("price", {
							rules: [
								{
									required: true,
									message: "Xin h??y ??i???n gi?? cho nh??/ph??ng c???a b???n",
								},
							],
						})(<InputNumber min={0} placeholder="120" />)}
					</Item>
				</Form>
			</Content>
				</Modal>
				<Table
					rowSelection={rowSelection}
					columns={tablecolumns}
					dataSource={tabledata}
					style={{ paddingTop: "5px" }}
				/>
			</div>
		) : null;

	const UpdatelistingsSectionElement = recordRow ? (
		<Drawer
			width={640}
			placement="right"
			closable={false}
			onClose={onClose}
			visible={drawervisible}
		>
			<Content className="host-content">
				<Form layout="vertical">
					<Item label="Lo???i Nh??/Ph??ng">
						{getFieldDecorator("type", {
							rules: [
								{
									required: true,
									message: "Xin h??y ch???n lo???i nh??/ph??ng!",
								},
							],
						})(
							<Radio.Group>
								<Radio.Button value={ListingType.APARTMENT}>
									<Icon type="bank" style={{ color: iconColor }} />{" "}
									<span>Chung c??</span>
								</Radio.Button>
								<Radio.Button value={ListingType.HOUSE}>
									<Icon type="home" style={{ color: iconColor }} />{" "}
									<span>Nh??</span>
								</Radio.Button>
							</Radio.Group>
						)}
					</Item>

					<Item label="S??? kh??ch t???i ??a">
						{getFieldDecorator("numOfGuests", {
							rules: [
								{
									required: true,
									message: "Xin h??y nh???p s??? kh??ch t???i ??a c???a nh??/ph??ng !",
								},
							],
						})(
							<InputNumber min={1} placeholder={`${recordRow.numOfGuests}`} />
						)}
					</Item>

					<Item label="Ti??u ?????" extra="S??? k?? t??? t???i ??a l?? 45">
						{getFieldDecorator("title", {
							rules: [
								{
									required: true,
									message: "Xin h??y ??i???n ti??u ????? cho nh??/ph??ng c???a b???n!",
								},
							],
						})(<Input maxLength={45} placeholder={recordRow.title} />)}
					</Item>

					<Item label="Mi??u t??? v??? nh??/ph??ng" extra="S??? k?? t??? t???i ??a l?? 400">
						{getFieldDecorator("description", {
							rules: [
								{
									required: true,
									message: "Xin h??y ??i???n mi??u t??? cho nh??/ph??ng c???a b???n!",
								},
							],
						})(
							<Input.TextArea
								rows={3}
								maxLength={400}
								placeholder={recordRow.description}
							/>
						)}
					</Item>

					<Item label="?????a ch???">
						{getFieldDecorator("address", {
							rules: [
								{
									required: true,
									message: "Xin h??y ??i???n ?????a ch??? nh??/ph??ng c???a b???n!",
								},
							],
						})(<Input placeholder={recordRow.address} />)}
					</Item>

					<Item label="Th??nh Ph???/X??">
						{getFieldDecorator("city", {
							rules: [
								{
									required: true,
									message:
										"Xin h??y ??i???n t??n th??nh ph??? (khu v???c) c???a nh??/ph??ng c???a b???n!",
								},
							],
						})(<Input placeholder={recordRow.city} />)}
					</Item>

					<Item label="T???nh">
						{getFieldDecorator("state", {
							rules: [
								{
									required: true,
									message: "Xin h??y ??i???n t??n T???nh c???a nh??/ph??ng c???a b???n!",
								},
							],
						})(<Input placeholder={recordRow.admin} />)}
					</Item>

					<Item label="M?? Zip/B??u ??i???n">
						{getFieldDecorator("postalCode", {
							rules: [
								{
									required: false,
									message:
										"Xin h??y ??i???n m?? zip (ho???c m?? b??u ??i???n) c???a nh??/ph??ng b???n!",
								},
							],
						})(
							<Input placeholder="Vui l??ng nh???p m?? Zip cho nh??/ph??ng c???a b???n!" />
						)}
					</Item>

					<Item
						label="H??nh ???nh"
						extra="H??nh ???nh ph???i c?? k??ch th?????c d?????i 1MB v?? thu???c lo???i JPG ho???c PNG"
					>
						<div className="host__form-image-upload">
							{getFieldDecorator("image", {
								rules: [
									{
										required: true,
										message: "Xin h??y cung c???p h??nh ???nh cho nh??/ph??ng c???a b???n",
									},
								],
							})(
								<Upload
									name="image"
									listType="picture-card"
									action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
									showUploadList={false}
									beforeUpload={beforeImageUpload}
									onChange={handleImageUpload}
								>
									{imageBase64Value ? (
										<img src={imageBase64Value} alt="Listing" />
									) : (
										<div>
											<Icon type={imageLoading ? "loading" : "plus"} />
											<div className="ant-upload-text">T???i l??n</div>
										</div>
									)}
								</Upload>
							)}
						</div>
					</Item>

					<Item label="Gi??" extra="T???t c??? t??nh b???ng $/ng??y">
						{getFieldDecorator("price", {
							rules: [
								{
									required: true,
									message: "Xin h??y ??i???n gi?? cho nh??/ph??ng c???a b???n",
								},
							],
						})(<InputNumber min={0} placeholder="120" />)}
					</Item>
				</Form>
				<div
					style={{
						position: "absolute",
						right: 0,
						bottom: 0,
						width: "100%",
						borderTop: "1px solid #e9e9e9",
						padding: "10px 16px",
						background: "#fff",
						textAlign: "right",
					}}
				>
					<Button onClick={onClose} style={{ marginRight: 8 }}>
						Cancel
					</Button>
					<Button onClick={handleUpdateListing} type="primary">
						Submit
					</Button>
				</div>
			</Content>
		</Drawer>
	) : null;

	if (HostListingdata && HostListingdata.hostListing) {
		return <Redirect to={`/listing/${HostListingdata.hostListing.id}`} />;
	}

	if (UpdateListingdata && UpdateListingdata.updateListing) {
		return <Redirect to={`/admin/listings`} />;
	}

	if (!viewer.isadmin) {
		return (
			<Result
				status="403"
				title="403"
				subTitle="Sorry, you are not authorized to access this page."
				extra={
					<Link to="/login">
						<Button type="primary">Go to Login</Button>
					</Link>
				}
			/>
		);
	}

	return (
		<Layout style={{ minHeight: "100vh" }}>
			{sliderElement}
			<Layout>
				<div className="table">
					{CardlistingsElement}
					{UpdatelistingsSectionElement}
					{listingsSectionElement}
				</div>
			</Layout>
		</Layout>
	);
};

export const WrappedListListings = Form.create<Props & FormComponentProps>({
	name: "listlistings_form",
})(ListListings);
