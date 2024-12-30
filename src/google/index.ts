export const html = (date: string) => {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <title>Personal Leave Notice</title>
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; font-size: 14px; color: #333;">
  <!-- 메일 내용 영역 -->
  <p style="margin: 0 0 16px 0;">
    Hello everyone,
  </p>
  <p style="margin: 0 0 16px 0;">
    I will be taking personal leave on ${date}.<br />
    If there are any urgent matters, please feel free to reach out to me via KakaoTalk.
  </p>
  <p style="margin: 0 0 16px 0;">
    Thank you for your understanding.
  </p>
  <p style="margin: 0 0 40px 0;">
    Best regards,<br />
    --<br />
    -<br />
    -
  </p>

  <!-- 서명(Signature) 영역 -->
  <table style="border-collapse: collapse;">
    <tr>
      <td style="vertical-align: top; padding-right: 16px;">
        <p style="margin: 0 0 4px 0;"><strong>Jay Lim</strong> | 임준 Manager</p>
        <p style="margin: 0 0 16px 0;"><strong>Madsquare</strong> R&D Department / Development Team</p>
      </td>
    </tr>
    <tr>
      <td style="padding-top: 8px;">
        <p style="margin: 0;">tel. +82 2 552 9516</p>
        <p style="margin: 0;">fax. +82 2 6312 9516</p>
        <p style="margin: 0;">mobile. +82 10 4927 3700</p>
        <p style="margin: 0;">
          email. <a href="mailto:jay@madsq.net" style="color: blue; text-decoration: underline;">jay@madsq.net</a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding-top: 8px;">
        <p style="margin: 0 0 4px 0;">경기도 성남시 분당구 판교로 253,</p>
        <p style="margin: 0 0 16px 0;">판교이노밸리 C동 10층 CHARIS</p>
      </td>
    </tr>
    <tr>
      <td style="padding-top: 12px;">
        <img src="https://ci3.googleusercontent.com/mail-sig/AIorK4yzR2iHg7VcPQC0v2FNTGOARWS8TqYPezm86ivtvkFEpMpYbVT9GWb1s4jG2amaZt9doeLU2Pc3zSnQ" alt="CHARIS Logo" style="height: 24px;" />
      </td>
    </tr>
  </table>

  <!-- 푸터 문구(Notice) -->
  <p style="font-size: 12px; color: #666; line-height: 1.4;">
    상기 메일은 지정된 수신인을 위한 것이며, 부정경쟁방지 및 영업비밀의 보호에 관한 법률과 기타의 관계 법령에 따라 
    보호의 대상이 되는 영업비밀, 기밀정보 등을 포함하고 있을 수 있습니다. 본 문서에 포함된 정보의 전부 또는 일부를 무단으로 
    제3자에게 공개, 배포, 복사 또는 사용하는 것은 엄격히 금지됩니다. 본 메일이 잘못 전송된 경우, 발신인 또는 당사에 
    알려주시고, 본 메일을 즉시 삭제하여 주시기 바랍니다.
  </p>
  <p style="font-size: 12px; color: #666; line-height: 1.4;">
    NOTICE: The content of this email is confidential and intended for the recipient specified in this message only. 
    It is strictly forbidden to share any part of this message with any third party without a written consent of the sender. 
    If you are not the intended recipient, please notify the sender immediately by replying to this message and delete the original 
    message including any attachments.
  </p>
</body>
</html>`;
};
