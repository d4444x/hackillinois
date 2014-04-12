from twilio.rest import TwilioRestClient
import APIconstants as con
def text_person(number,message):
   account_sid = con.TWILIO_ACCOUNT_SID
   auth_token = con.TWILIO_AUTH_TOKEN
   client = TwilioRestClient(account_sid, auth_token)
   message = client.messages.create(to="+1"+number, from_="+17652050444",body=message)


