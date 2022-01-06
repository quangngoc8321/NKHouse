import React, { Fragment } from "react";
import { Avatar, Button, Card, Divider, Typography, Tag } from "antd";
import { User as UserData } from "../../../../lib/graphql/queries/User/__generated__/User";
import { Viewer } from "../../../../lib/types";
import {
  displayErrorNotification,
  displaySuccessNotification,
  formatListingPrice,
} from "../../../../lib/utils";
import { DisconnectStripe as DisconnectStripeData } from "../../../../lib/graphql/mutation/DisconnectStripe/__generated__/DisconnectStripe";
import { useMutation } from "@apollo/react-hooks";
import { DISCONNECT_STRIPE } from "../../../../lib/graphql/mutation";

interface Props {
  user: UserData["user"];
  viewer: Viewer;
  viewerIsUser: boolean;
  setViewer: (viewer: Viewer) => void;
  handleUserRefetch: () => Promise<void>;
}

const stripeAuthUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.REACT_APP_S_CLIENT_ID}&scope=read_write`;

const { Paragraph, Text, Title } = Typography;

export const UserProfile = ({
  user,
  viewer,
  viewerIsUser,
  setViewer,
  handleUserRefetch,
}: Props) => {
  const [disconnectStripe, { loading }] = useMutation<DisconnectStripeData>(
    DISCONNECT_STRIPE,
    {
      onCompleted: (data) => {
        if (data && data.disconnectStripe) {
          setViewer({ ...viewer, hasWallet: data.disconnectStripe.hasWallet });
          displaySuccessNotification(
            "Bạn đã ngắt kết nối Stripe thành công!",
            "Bạn phải kết nối lại với Stripe để có thể tiếp tục cho thuê nhà/phòng!"
          );
          handleUserRefetch();
        }
      },
      onError: () => {
        displayErrorNotification(
          "Xin lỗi! Chúng tôi hiện không ngắt kết nối được tài khoản Stripe của bạn !"
        );
      },
    }
  );

  const redirectToStripe = () => {
    window.location.href = stripeAuthUrl;
  };

  const additionalDetails = user.hasWallet ? (
    <Fragment>
      <Paragraph>
        <Tag color="green">Đã đăng ký Stripe </Tag>
      </Paragraph>
      <Paragraph>
        Thu nhập:{" "}
        <Text strong>
          {user.income ? formatListingPrice(user.income) : `0$`}
        </Text>
      </Paragraph>
      <Button
        type="primary"
        className="user-profile__details-cta"
        loading={loading}
        onClick={() => disconnectStripe()}
      >
        Ngắt kết nối Stripe
      </Button>
      <Paragraph type="secondary">
        Bằng cách ngắt kết nối, bạn sẽ không thể nhận thêm{" "}
        <Text strong> bất kỳ khoản thanh toán nào</Text>. Điều này sẽ ngăn người
        dùng đặt trước danh sách mà bạn có thể đã tạo.
      </Paragraph>
    </Fragment>
  ) : (
    <Fragment>
      <Paragraph>
        Bạn muốn trở thành một người cho thuê nhà/phòng.Hãy đăng ký với tài
        khoản Stripe!
      </Paragraph>
      <Button
        type="primary"
        className="user-profile__details-cta"
        onClick={redirectToStripe}
      >
        Kết nối với tài khoản Stripe
      </Button>
      <Paragraph type="secondary">
        NKHouse dùng{""}
        <a
          href="https://stripe.com/en-US/connect"
          rel="nooper noreferrer"
        >
          {" "}
          Stripe
        </a>{" "}
        {""}
        để giúp chuyển thu nhập của bạn một cách an toàn và đáng tin cậy
      </Paragraph>
    </Fragment>
  );

  const additionalDetailsSection = viewerIsUser ? (
    <Fragment>
      <Divider />
      <div className="user-profile__details">
        <Title level={4}>Thông tin bổ sung</Title>
        {additionalDetails}
      </div>
    </Fragment>
  ) : null;

  return (
    <div className="user-profile">
      <Card className="user-profile__card">
        <div className="user-profile__avatar">
          <Avatar size={100} src={user.avatar} />
        </div>
        <Divider />
        <div className="user-profile__details">
          <Title level={4}> Thông tin </Title>
          <Paragraph>
            Tên: <Text strong>{user.name}</Text>
          </Paragraph>
          <Paragraph>
            Liên hệ: <Text strong>{user.contact}</Text>
          </Paragraph>
          <Paragraph>
            Role: <Text strong>{user.isadmin ? "Admin" : user.isreviewer ? "Reviewer" : "User"}</Text>
          </Paragraph>
        </div>
        {additionalDetailsSection}
      </Card>
    </div>
  );
};
