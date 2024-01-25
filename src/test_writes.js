import { check, sleep } from 'k6';
import api from '/src/api.js';
import * as faker from 'faker/locale/en_US';
import setup_listing from '/src/setup_listing.js';

export const options = {
  scenarios: {
    app_browsing_reads: {
      //Name of executor
      executor: 'constant-vus',
      vus: 100,
      duration: '5m',
      // more configuration here
    },
  },
};

export function setup() {
  const partialPhoneNumber = faker.random.number({ min: 1000000000, max: 9999999999 })
  const otp_res = api.sendOtp(`+99${partialPhoneNumber}`);
  check(otp_res, { 'OTP was 201': (r) => r.status == 201 });
  const auth_res = api.validateOtpCode(`+99${partialPhoneNumber}`,"0000");
  check(auth_res, { 'Auth was 200': (r) => r.status == 200 });

  if (auth_res.status != 200) {
    console.log("Auth failed");
    return { access: null };
  }

  const access = auth_res.json().meta.tokens.access;

  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const email = faker.internet.email();
  const dateOfBirth = faker.date.past(25, new Date(2000, 0, 1));

  const onboarding_res = api.completeOnboarding(access,firstName,lastName,email,dateOfBirth);
  check(onboarding_res, { 'Account Onboarding was 200': (r) => r.status == 200 });

  const gender = faker.random.number({ min: 0, max: 1 }) == 0 ? 'male' : 'female'
  const bio = faker.lorem.sentences()
  const address = faker.address.streetAddress()
  const city = faker.address.city()
  const usernamePostfix = faker.random.number({ min: 10000, max: 99999 })
  const user_profile_res = api.completeUserProfile(access,bio, `loadtestuser${usernamePostfix}`,`${city} High School`,`${address}, ${city}`,gender)
  check(user_profile_res, { 'Profile Setup was 200': (r) => r.status == 200 });

  const address2 = faker.address.streetAddress()

  const seller_profile_res = api.sellerOnboarding(access, {
    company_name: `${firstName}s shoe company`,
    first_name: firstName,
    last_name: lastName,
    country: "GB",
    city: city,
    region: city,
    contact_number: `+99${partialPhoneNumber}`,
    zip: "0000 000",
    street_address_1: address,
    street_address_2: address2,
    vat: "yes",
    registration_number: "00000000000",
    company_type: "private_company"
  });
  check(seller_profile_res, { 'Seller profile setup was 200': (r) => r.status == 200 });
  const seller_agreement_res = api.sellerAgreement(access);

  check(seller_agreement_res, { 'Seller agreement was 200': (r) => r.status == 200 });

  return { access: access };
}

export default function (data) {

  if(data.access == null){
    console.log("No Auth Token");
    return;
  }

  const listing = setup_listing({access: data.access});

  const end_listing_res =  api.endProductListing(data.access, {
    listing_id: listing.listing_id
  });
  console.log(end_listing_res.status)
  check(end_listing_res, { 'POST End Listing': (r) => r.status == 201 });
}

export function teardown(data) {
  const remove_account_res = api.removeAccount(data.access);
  console.log(remove_account_res.body)
  check(remove_account_res, { 'Account Removal was 204': (r) => r.status == 204 });
}
