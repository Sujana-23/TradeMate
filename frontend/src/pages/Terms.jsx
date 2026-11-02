
import './Auth.css';

function Terms({ onClose }) {
  return (
    <div className="terms-overlay">
      <div className="terms-modal">
        <button
          className="terms-close"
          onClick={onClose}
        >
          ✕
        </button>

        <h2>Terms and Conditions</h2>
        <p>Last Updated: November 2026</p>

        <div className="terms-content">
          <h3>1. Acceptance of Terms</h3>
          <p>By registering for TradeMate, you agree to these terms.</p>

          <h3>2. Account Registration</h3>
          <p>Users must provide valid email and phone details and
          maintain the security of their accounts.</p>

          <h3>3. Currency Exchange Rates</h3>
          <p>Exchange rates are provided for informational purposes
          and may change frequently.</p>

          <h3>4. Financial Disclaimer</h3>
          <p>TradeMate does not provide financial or investment advice.</p>

          <h3>5. User Responsibilities</h3>
          <p>Users must provide accurate information and must not
          misuse the platform.</p>

          <h3>6. Privacy</h3>
          <p>User information must be handled according to the
          TradeMate Privacy Policy.</p>

          <h3>7. Account Suspension</h3>
          <p>Accounts involved in misuse may be suspended.</p>

          <h3>8. Changes to Terms</h3>
          <p>TradeMate may update these terms when necessary.</p>

          <h3>9. Contact</h3>
          <p>Contact the TradeMate support team for assistance.</p>
        </div>

        <button
          className="auth-submit"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default Terms;
