import { check } from 'k6';
import api from '/src/api.js';
import * as faker from 'faker/locale/en_US';

export const options = {
  scenarios: {
    app_browsing_reads: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '50s', target: 33 },
        { duration: '100s', target: 66 },
        { duration: '150s', target: 100 },
        { duration: '200s', target: 300 },
        { duration: '300s', target: 500 },
      ],
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

  return { access: access };
}

export default function (data) {

  if(data.access == null){
    console.log("No Auth Token");
    return;
  }

  //Categories and Subcategories
  const product_categories_res = api.getProductCategories(data.access);
  check(product_categories_res, { 'Get Categories 200': (r) => r.status == 200 });

  if(product_categories_res.status == 200){
    const category_id = product_categories_res.json().data[0].id
    const product_subcategories_res = api.getProductSubCategories(data.access,category_id);
    check(product_subcategories_res, { 'Get SubCategories 200': (r) => r.status == 200 });
  }else{
    console.log("Could not get categories, skipping subcategories")
  }

  // Catalouge
  const product_variants_res = api.getProductVariants(data.access,"nike");
  check(product_variants_res, { 'Get Cataloge 200': (r) => r.status == 200 });

  if(product_variants_res.status == 200){
    const product_variant_id = product_variants_res.json().data[0].id

    // Product Variants
    const product_variants_details_res = api.getProductVariantDetails(data.access, product_variant_id);
    check(product_variants_details_res, { 'Get Product Variant Details 200': (r) => r.status == 200 });

    const product_variants_listing_res = api.getProductVariantListings(data.access, product_variant_id);
    check(product_variants_listing_res, { 'Get Product Variant Listing 200': (r) => r.status == 200 });

    // Reviews
    const product_variants_reviews_res = api.getProductVariantReviews(data.access, product_variant_id);
    check(product_variants_reviews_res, { 'Get Product Variant Reviews 200': (r) => r.status == 200 });

    //Size Chrt
    const size_chart_res = api.getSizeChart(data.access, product_variant_id);
    check(size_chart_res, { 'Get Size Chart 200': (r) => r.status == 200 });
  } else {
    console.log("Could not get product variants, skipping variant details, listings, reviews and size chart")
  }

  const used_product_variants_res = api.getUsedProductVariants(data.access,"nike");
  check(used_product_variants_res, { 'Get Used Cataloge 200': (r) => r.status == 200 });
  
  // Brands
  const brands_res = api.getBrands(data.access);
  check(brands_res, { 'Get Brands 200': (r) => r.status == 200 });

  // Styles
  const styles_res = api.getStyles(data.access);
  check(styles_res, { 'Get Styles 200': (r) => r.status == 200 });

  // Size Chart
  const size_categories_res = api.getSizeCategories(data.access);
  check(size_categories_res, { 'Get Size Categories 200': (r) => r.status == 200 });
}

export function teardown(data) {
  const remove_account_res = api.removeAccount(data.access);
  check(remove_account_res, { 'Account Removal was 204': (r) => r.status == 204 });
}