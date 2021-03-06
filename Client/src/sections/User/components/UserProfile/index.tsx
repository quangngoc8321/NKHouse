import React, { Fragment, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Divider,
  Typography,
  Tag,
  Input,
  Icon,
} from "antd";
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
import { useDispatch } from "react-redux";
import { useSnackbar } from "react-simple-snackbar";
import { useHistory } from "react-router-dom";
import * as MeetingAPi from "../../../Meet/lib/meeting-api";
import { getErrorMessage } from "../../../Meet/lib/error-handling";
import { start } from "../../../Meet/store/meeting/actions";
import {
  SendMeetEmail as SendMeetEmailData,
  SendMeetEmailVariables,
} from "../../../../lib/graphql/mutation/SendMeetEmail/__generated__/SendMeetEmail";
import { SEND_MEET_EMAIL } from "../../../../lib/graphql/mutation/SendMeetEmail";

interface Props {
  user: UserData["user"];
  viewer: Viewer;
  viewerIsUser: boolean;
  setViewer: (viewer: Viewer) => void;
  handleUserRefetch: () => Promise<void>;
}

const stripeAuthUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.REACT_APP_S_CLIENT_ID}&scope=read_write`;

const { Paragraph, Text, Title } = Typography;

const { Search } = Input;

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
            "B???n ???? ng???t k???t n???i Stripe th??nh c??ng!",
            "B???n ph???i k???t n???i l???i v???i Stripe ????? c?? th??? ti???p t???c cho thu?? nh??/ph??ng!"
          );
          handleUserRefetch();
        }
      },
      onError: () => {
        displayErrorNotification(
          "Xin l???i! Ch??ng t??i hi???n kh??ng ng???t k???t n???i ???????c t??i kho???n Stripe c???a b???n !"
        );
      },
    }
  );

  const [sendMeetEmail, { data: SendMeetEmaildata }] = useMutation<
    SendMeetEmailData,
    SendMeetEmailVariables
  >(SEND_MEET_EMAIL);

  const dispatch = useDispatch();
  const history = useHistory();
  const [openSnackbar] = useSnackbar({
    position: "top-center",
  });

  const startMeeting = async (hour:string) => {
    try {
      const { meetingId } = await MeetingAPi.start("");
      sendMeetEmail({
        variables: {
          id: user.id,
          hour: hour,
          subject: "H???n g???p m???t ??? NKMeet",
          mess: `NKMeet g???i l???ch h???n g???p m???t ???????ng link http://localhost:3000/meeting/${meetingId}`,
        },
      });
      dispatch(start({ name: "", meetingId }));
      history.push(`/meeting/${meetingId}`);
    } catch (error) {
      openSnackbar(getErrorMessage(error));
    }
  };


  const redirectToStripe = () => {
    window.location.href = stripeAuthUrl;
  };

  const MeetButton = viewerIsUser ? null : (
    <Search
      placeholder="Nh???p gi??? c???n h???n"
      enterButton="H???n g???p"
      suffix = "gi???"
      onSearch={(value) => startMeeting(value)}
    />
  );

  const additionalDetails = user.hasWallet ? (
    <Fragment>
      <Paragraph>
        <Tag color="green">???? ????ng k?? Stripe</Tag>
      </Paragraph>
      <Paragraph>
        Thu nh???p:{" "}
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
        Ng???t k???t n???i Stripe
      </Button>
      <Paragraph type="secondary">
        B???ng c??ch ng???t k???t n???i, b???n s??? kh??ng th??? nh???n th??m{" "}
        <Text strong> b???t k??? kho???n thanh to??n n??o</Text>. ??i???u n??y s??? ng??n ng?????i
        d??ng ?????t tr?????c danh s??ch m?? b???n c?? th??? ???? t???o.
      </Paragraph>
    </Fragment>
  ) : (
    <Fragment>
      <Paragraph>
        B???n mu???n tr??? th??nh m???t ng?????i cho thu?? nh??/ph??ng.H??y ????ng k?? v???i t??i
        kho???n Stripe!
      </Paragraph>
      <Button
        type="primary"
        className="user-profile__details-cta"
        onClick={redirectToStripe}
      >
        K???t n???i v???i t??i kho???n Stripe
      </Button>
      <Paragraph type="secondary">
        NKHouse d??ng{""}
        <a href="https://stripe.com/en-US/connect" rel="nooper noreferrer">
          {" "}
          Stripe
        </a>{" "}
        {""}
        ????? gi??p chuy???n thu nh???p c???a b???n m???t c??ch an to??n v?? ????ng tin c???y
      </Paragraph>
    </Fragment>
  );

  const additionalDetailsSection = viewerIsUser ? (
    <Fragment>
      <Divider />
      <div className="user-profile__details">
        <Title level={4}>Th??ng tin b??? sung</Title>
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
          <Title level={4}> Th??ng tin </Title>
          <Paragraph>
            T??n: <Text strong>{user.name}</Text>
          </Paragraph>
          <Paragraph>
            Li??n h???: <Text strong>{user.contact}</Text>
          </Paragraph>
          <Paragraph>
            Role:{" "}
            <Text strong>
              {user.isadmin ? "Admin" : user.isreviewer ? "Reviewer" : "User"}
            </Text>
          </Paragraph>
          {MeetButton}
        </div>
        {additionalDetailsSection}
      </Card>
    </div>
  );
};
