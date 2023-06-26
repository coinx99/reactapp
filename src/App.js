import { Component } from 'react';
import { createBrowserRouter, RouterProvider, } from 'react-router-dom';
import i18n from './i18n';
import { Card, Col, Container, Modal, Nav, Navbar, NavDropdown, Row } from "react-bootstrap";
import Settings, { loadSetting, saveSetting, SettingsEvent } from "./store/Settings";

import Menu from "./com/Menu"
import Footer from "./com/Footer"
import './App.css';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import Trade from './com/Trade';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Trade />,
  },
  {
    path: "/trade",
    element: <Trade />,
  },
])

class App extends Component {
  componentDidMount() {
    let { loadSetting, setting } = this.props;
    SettingsEvent.on("loaded", ({ after }) => {
      document.body.setAttribute('data-bs-theme', after.theme)
    })
    document.body.setAttribute('data-bs-theme', setting.theme)
    loadSetting() //.then(console.log)
  }
  render() {
    return (
      <Container fluid data-bs-theme="dark">
        <Menu />
        <Row style={{ "minHeight": "40em" }}>
          <RouterProvider router={router} />

        </Row>
        <Footer />
      </Container >
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  setting: state.Settings.setting,
});

export default connect(mapStateToProps, {
  saveSetting: saveSetting,
  loadSetting: loadSetting,
})(withTranslation()(App));

