type ForgotPasswordProps = {
  displayName: string;
  email: string;
  url: string;
};

class Templates {
  static forgotPassword = ({ displayName, email, url }: ForgotPasswordProps) => {
    return `
    <h1>Thay đổi mật khẩu</h1>
    <p>Xin chào. ${displayName} <i>(${email})</i></p>
    <p>Bạn nhận được email này vì đã click vào quên mật khẩu trên website đặt phòng lịch khám bệnh của chúng tôi</p>
    <p style="color: red">Nếu những thông tin trên là chính xác. Vui lòng click vào link bên dưới để xác nhận và hoàn tất thủ tục thay đổi mật khẩu</>
    <div><a href=${url} target="_blank"><strong>Link thay đổi</strong></a></div><br>
    <div><strong><i>Xin chân thành cảm ơn!</i></strong></div>
    `;
  };
  static verifyAccount = ({ displayName, url }: Omit<ForgotPasswordProps, "email">) => {
    return `
    <h1>Xác thực tài khoản</h1>
    <p>Xin chào. ${displayName}</p>
    <p>Bạn nhận được email này vì đã đăng ký trên website đặt phòng lịch khám bệnh của chúng tôi</p>
    <p style="color: red">Nếu những thông tin trên là chính xác. Vui lòng click vào link bên dưới để xác nhận và hoàn tất thủ tục xác thực tài khoản</>
    <div><a href=${url} target="_blank"><strong>Link xác nhận</strong></a></div><br>
    <div><strong><i>Xin chân thành cảm ơn!</i></strong></div>
    `;
  };
}

export default Templates;
