import { check, sleep } from 'k6';
import api from '/src/api.js';
import * as faker from 'faker/locale/en_US';
import setup_listing from '/src/setup_listing.js';

export const options = {
  scenarios: {
    app_browsing_reads: {
      //Name of executor
      executor: 'constant-vus',
      vus: 2,
      duration: '10s',
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

  const buyer_delivery_address = {
    first_name: firstName,
    last_name: lastName,
    country: "GB",
    city: city,
    region: city,
    contact_number: `+99${partialPhoneNumber}`,
    zip: "0000 000",
    street_address_1: address,
    street_address_2: address2
  }
 
  return { access: access, buyer_delivery_address: buyer_delivery_address };
}

export default function (data) {
  if(data.access == null){
    console.log("No Auth Token");
    return;
  }

  const listing = setup_listing({access: data.access});

  const bid_payload = {
    offer_type: listing.listing_type,
    product_variant_id: listing.product_variant_id,
    size_item_id: listing.size_item_id,
    listing_id: listing.listing_id,
    expiration: 7,
    asking_price_cents: 10,
    delivery_address: {
      first_name: data.buyer_delivery_address.first_name,
      last_name: data.buyer_delivery_address.last_name,
      contact_number: data.buyer_delivery_address.contact_number,
      country: data.buyer_delivery_address.country,
      city: data.buyer_delivery_address.city,
      region: data.buyer_delivery_address.region,
      zip: data.buyer_delivery_address.zip,
      street_address_1: data.buyer_delivery_address.street_address_1,
      street_address_2: data.buyer_delivery_address.street_address_2
    }
  }

  const offer_res = api.createOffer(data.access, bid_payload)
  check(offer_res, { 'POST Offer': (r) => r.status == 201 });

  let offer_id = null;
  let offer_search_res = null;
  while(!offer_id)
  {
    sleep(1);
    offer_search_res = api.searchAccountOffers(data.access, listing.listing_type)
    const offer = offer_search_res.json().data.filter(function(offer) {
      return offer.attributes.fitting_listing_id == listing.listing_id;
    })
    if(offer)
    {
      offer_id = offer[0].id
    }
    console.log(offer_id)
  }

  check(offer_search_res, { 'GET Offers': (r) => r.status == 200 });
  const offer_accepted_res = api.acceptOffer(data.access, offer_id);
  check(offer_accepted_res, { 'POST Accept Offer': (r) => r.status == 201 });

  // Add listing to cart

  // Checkout and pay

  // End listing
  // const end_listing_res =  api.endProductListing(data.access, {
  //   listing_id: listing.listing_id
  // });
  // check(end_listing_res, { 'POST End Listing': (r) => r.status == 201 });   
  
}


export function teardown(data) {
  const remove_account_res = api.removeAccount(data.access);
  check(remove_account_res, { 'Account Removal was 204': (r) => r.status == 204 });
}
