require('dotenv').config()

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verificationSid = process.env.VERIFICATION_SID;

const twilioClient = require('twilio')(accountSid, authToken);

const send = async (phoneNumber) => {
  const res = await twilioClient.verify.v2.services(verificationSid)
                                          .verifications
                                          .create({to: phoneNumber, channel: 'sms'})
                                          .then((verification) => {
                                            // console.log(verification.status)
                                            return verification.status
                                          })
                                          // .catch(res.status(400).send({message: "Wrong something :("}))
  // console.log('res:', res);
  return res
}

const check = async (phoneNumber, code) => {
  const res = await twilioClient.verify.v2.services(verificationSid)
                                          .verificationChecks
                                          .create({to: phoneNumber, code: code})
                                          .then(verification_check => {
                                            // console.log(verification_check.status)
                                            return verification_check.status
                                          })
                                          // .catch(res.status(400).send({message: "Wrong something :("}))
  // console.log('res:', res);
  return res
}

class TwilioController {  
  async send(req, res){
    const phoneNumber = '+' + req.query.phonenumber;
    // console.log('phoneNumber:', );
    const result = await send(phoneNumber)
    if(result === 'pending') 
      return res.status(200).json({message: "Verification is started"})
    return res.status(400).send({message: "Wrong phone number :("})
  }
  
  async check(req, res){
    const phoneNumber = '+' + req.query.phonenumber,
          code = req.query.code;
    // console.log('phoneNumber:', phoneNumber);
    // console.log('code:', code);
    const result = await check(phoneNumber, code)
    if(result === 'approved') 
      return res.status(200).json({message: "Verification is complete"})

    return res.status(400).json({message: "Wrong code :("})
  }
}

module.exports = new TwilioController()