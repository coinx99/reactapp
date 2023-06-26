import React from "react"
import { connect } from 'react-redux';
import { Container, Form, Nav, Navbar, NavDropdown, Row } from "react-bootstrap";
import { loadSetting, saveSetting } from "../store/Settings";

import { withTranslation } from "react-i18next";
import { log } from "../std";

class Menu extends React.Component {
    constructor(props) {
        super(props)

        this.changeLanguage.bind(this)
        this.changeTheme.bind(this)
    }
    componentDidMount() {
        let { i18n } = this.props

        i18n.changeLanguage(this.props.setting.language)
    }

    componentDidUpdate(preProps) {
        let { web3, connectWeb3, connectWebsocketServer, loadSetting, i18n } = this.props
        if (this.props.setting.language != preProps.setting.language)
            i18n.changeLanguage(this.props.setting.language)
    }

    changeLanguage(lang = 'en') {
        let { saveSetting, i18n } = this.props
        let key = "language", value = lang;
        log(lang)
        saveSetting({ key, value }).then(log)
        i18n.changeLanguage(lang)
    }

    changeTheme(e) {
        let { saveSetting, i18n } = this.props
        log(e.target.value)
        let key = "theme", value = e.target.value == "dark" ? "light" : "dark"

        saveSetting({ key, value }).then(r => {
            if (r.error)
                throw r.error
            document.body.setAttribute('data-bs-theme', value)
        })
    }

    render() {
        let { setting, t } = this.props
        return (<Row>
            <Navbar bg="primary" expand="lg">
                <Container> {/* {pathname} */}
                    <Navbar.Brand href="/">🏠</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav style={{ color: "white" }}>
                            <Nav.Link href="/trade">Trade</Nav.Link>

                            <NavDropdown title={"🌎 " + t("FLAG")}>
                                <NavDropdown.Item href={"#vi"} onClick={() => this.changeLanguage('vi')}>
                                    Tiếng Việt
                                </NavDropdown.Item>
                                <NavDropdown.Item href="#en" onClick={() => this.changeLanguage()}>
                                    English
                                </NavDropdown.Item>
                            </NavDropdown>
                            <label className="nav-link">
                                <Form.Check
                                    type="switch"
                                    value={setting.theme}
                                    onChange={this.changeTheme.bind(this)}
                                    checked={setting.theme == "dark"}
                                />
                            </label>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </Row >)
    }
}

const mapStateToProps = (state, ownProps) => ({
    setting: state.Settings.setting,
});

export default connect(mapStateToProps, {
    saveSetting: saveSetting,
    loadSetting: loadSetting,

})(withTranslation()(Menu));


