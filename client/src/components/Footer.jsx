import "../styles/Footer.scss"
import { LocalPhone, Email } from "@mui/icons-material"

const Footer = () => {
  return (
    <div id="footer" className="footer">
      <div className="footer_left">
        <a href="/home"><img src="Room_Booking.png" alt="logo" /></a>
      </div>

      <div className="footer_center">
        <h3>Useful Links</h3>
        <ul>
          <li>How to Book</li>
          <li>Policies & Terms</li>
          <li>Cancellations & Refunds</li>
        </ul>
      </div>

      <div className="footer_right">
        <h3>Contact</h3>
        <div className="footer_right_info">
          <LocalPhone />
          <p>+1 234 567 890</p>
        </div>
        <div className="footer_right_info">
          <Email />
          <p>booking@dreamnest.com</p>
        </div>
        <img src="/assets/payment.png" alt="payment" />
      </div>
    </div>
  )
}

export default Footer
