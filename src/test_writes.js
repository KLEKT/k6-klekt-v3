import { check, sleep } from 'k6';
import api from '/src/api.js';
import * as faker from 'faker/locale/en_US';

export const options = {
  scenarios: {
    app_browsing_reads: {
      //Name of executor
      executor: 'constant-vus',
      vus: 1,
      duration: '60s',
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
  // const seller_payment_res = api.sellerPayment(access, {transfer_method: "Bank Transfer"});
  // console.log(seller_payment_res.body)
  // check(seller_payment_res, { 'Seller payment was 200': (r) => r.status == 200 });
  return { access: access };
}

export default function (data) {

  if(data.access == null){
    console.log("No Auth Token");
    return;
  }
  // console.log(data.access)
  const product_variants_res = api.getProductVariants(data.access,"nike");
  check(product_variants_res, { 'GET Product variant': (r) => r.status == 200 });
  const product_variant_id = product_variants_res.json().data[0].id

  const size_chart_items_res = api.getSizeItems(data.access, product_variant_id);
  check(size_chart_items_res, { 'GET Size chart items': (r) => r.status == 200 });
  const size_item_id = size_chart_items_res.json().data[0].id
  const listing_res = api.createProductListing(data.access, {
    consignment: true,
    accept_bids: true,
    bid_range: 0,
    condition_description:  "This is a test listing",
    listing_type: "new_with_defect",
    box_condition: "good",
    expiration: 7,
    listing_photos: [
    ],
    listing_defects: [
    ],
    listings: [
      {
        preferred_income_cents: 10,
        quantity: 1,
        product_variant_id: product_variant_id,
        size_item_id: size_item_id
      }
    ]
  });
  check(listing_res, { 'POST New Listing': (r) => r.status == 201 });
  const listing_search_res = api.searchProductrListing(data.access)
  // sleep(30); # Maybe need to set some small value like 1 or 2 seconds
  check(listing_search_res, { 'GET listings': (r) => r.status == 200 });
  console.log(listing_search_res.status)
  console.log(listing_search_res.body)
  // const listing_id = listing_res.json().data.id
  // const end_listing_res =  api.endProductListing(data.access, {
  //   listing_id: listing_id
  // });
  // check(end_listing_res, { 'POST End Listing': (r) => r.status == 200 });
}

export function teardown(data) {
  const remove_account_res = api.removeAccount(data.access);
  check(remove_account_res, { 'Account Removal was 204': (r) => r.status == 204 });
  console.log(remove_account_res.status)
}
