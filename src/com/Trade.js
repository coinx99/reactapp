import React from "react"
import { connect } from 'react-redux';
import { Container } from "react-bootstrap";
import { loadSetting, saveSetting } from "../store/Settings";

import { withTranslation } from "react-i18next";
import { log } from "../std";

class Trade extends React.Component {
    constructor(props) {
        super(props)

    }

    render() {
        return (
            <>
                <Container>
                    s
                </Container>
            </>
        )
    }
}



const mapStateToProps = (state, ownProps) => ({
    setting: state.Settings.setting,
});

export default connect(mapStateToProps, {
    saveSetting: saveSetting,
    loadSetting: loadSetting,

})(withTranslation()(Trade));


