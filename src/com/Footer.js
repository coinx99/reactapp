import React from "react"
import { connect } from 'react-redux';

import { withTranslation } from "react-i18next";
import "./Footer.scss"

class Footer extends React.Component {

  render() {
    let { setting, t } = this.props
    return (<>
      {/* footer */}
      < footer className="footer">
        <ul className="social-links">
          <a className="social-link" href="https://t.me/coinx99" target='_blank'><img src={"img/telegram.svg"} /></a>
          <a className="social-link" href="https://www.tiktok.com/@coinx99" target='_blank'><img src={"img/tiktok.svg"} /></a>
          <a className="social-link" href="https://facebook.com/coinX99" target='_blank'><img src={"img/facebook.svg"} /></a>
          <a className="social-link" href="https://www.youtube.com/@coinx99" target='_blank'><img src={"img/youtube.svg"} /></a>
          <a className="social-link" href="https://twitter.com/coinx_trade" target='_blank'><img src={"img/twitter.svg"} /></a>
          <a className="social-link" href="https://www.instagram.com/coinx.trade/" target='_blank'><img src={"img/instagram.svg"} /></a>
        </ul>

        <p>
          &copy; 2023 &nbsp;
          <a className="menu__link" target='_blank' href={"https://" + setting.domain + "/about"}>@coinx99</a> | &nbsp;
          <a className="menu__link" target='_blank' href={"https://" + setting.domain}>{setting.domain}</a> | &nbsp;
          All Rights Reserved
        </p>

        <div className="waves">
          <div className="wave wave1"></div>
          <div className="wave wave2"></div>
          <div className="wave wave3"></div>
          <div className="wave wave4"></div>
        </div>

      </footer>
    </>)
  }
}

const mapStateToProps = (state, ownProps) => ({
  setting: state.Settings.setting,
});

export default connect(mapStateToProps, {
})(withTranslation()(Footer));
