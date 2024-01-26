import http from 'k6/http';

const baseURL = 'https://api.k-v3.com/api/v1';

function sendOtp(phoneNumber) {
    const res = http.post(`${baseURL}/account/authentication/send_code`,{ phone_number: phoneNumber });
    return res;
}

function validateOtpCode(phoneNumber, otpCode) {
    const res = http.post(`${baseURL}/account/authentication/validate_code`, { phone_number: phoneNumber, otp_code: otpCode });
    return res;
}

function completeOnboarding(access,first_name,last_name,email,date_of_birth) {
    const res = http.post(`${baseURL}/account/onboarding`, {
        first_name: first_name,
        last_name: last_name,
        email: email,
        date_of_birth: date_of_birth
      }, { headers: { Authorization: `Bearer ${access}` } });
    return res;
}

function completeUserProfile(access,description,username,school,location,gender) {
    const res = http.put(`${baseURL}/account/user_profile`, {
        description: description,
        username: username,
        school: school,
        location: location,
        gender: gender
      }, { headers: { Authorization: `Bearer ${access}` } });
    return res;
}

function getProductCategories(access) {
    const res = http.get(`${baseURL}/product_categories`, { headers: { Authorization: `Bearer ${access}` } });
    return res;
}

function getProductSubCategories(access,id) {
    const res = http.get(`${baseURL}/product_categories/${id}?expanded=true`, { headers: { Authorization: `Bearer ${access}` } });
    return res;
}

function getSizeCategories(access) {
    const res = http.get(`${baseURL}/size_categories`, { headers: { Authorization: `Bearer ${access}` } });
    return res;
}

function getSizeItems(access,product_variant_id) {
    const res = http.get(`${baseURL}/size_chart/size_items?product_variant_id=${product_variant_id}&with_price=true`, { headers: { Authorization: `Bearer ${access}` } });
    return res;
}

function getSizeChart(access,product_variant_id) {
    //api/v1/size_chart/size_items
    const res = http.get(`${baseURL}/size_chart?product_variant_id=${product_variant_id}&include=size_template%2Csize_items%2Csize_metrics`, { headers: { Authorization: `Bearer ${access}` } });
    return res;
}

function getStyles(access) {
    const res = http.get(`${baseURL}/styles`, { headers: { Authorization: `Bearer ${access}` } });
    return res;
}

function getProductVariants(access,search) {
    const res = http.get(`${baseURL}/catalogs?search=${search}`, { headers: { Authorization: `Bearer ${access}` } });
    return res;
}

function getUsedProductVariants(access,search) {
    const res = http.get(`${baseURL}/catalogs/used?search=${search}`, { headers: { Authorization: `Bearer ${access}` } });
    return res;
}

function getBrands(access) {
    const res = http.get(`${baseURL}/brands`, { headers: { Authorization: `Bearer ${access}` } });
    return res;
}

function getProductVariantDetails(access, id) {
    const res = http.get(`${baseURL}/product_variants/${id}`, { headers: { Authorization: `Bearer ${access}` } });
    return res;
}

function getProductVariantListings(access, id) {
    const res = http.get(`${baseURL}/product_variants/${id}/listings`, { headers: { Authorization: `Bearer ${access}` } });
    return res;
}

function getProductVariantReviews(access, id) {
    const res = http.get(`${baseURL}/product_variants/${id}/reviews`, { headers: { Authorization: `Bearer ${access}` } });
    return res;
}

function createProductListing(access,body) {
    const res = http.post(`${baseURL}/account/seller_profile/listing`,
        JSON.stringify(body),
        { headers: { Authorization: `Bearer ${access}`, "content-type": "application/json" } });
    return res;
}

function searchProductrListing(access) {
    const res = http.get(`${baseURL}/account/seller_profile/listings`,
        { headers: { Authorization: `Bearer ${access}` } });
    return res;
}

function searchProductrListingPage(access, page) {
    const res = http.get(`${baseURL}/account/seller_profile/listings?page=${page}`,
        { headers: { Authorization: `Bearer ${access}` } });
    return res;
}

function endProductListing(access, body) {
    const res = http.post(`${baseURL}/account/seller_profile/listing/end`,
        JSON.stringify(body),
        { headers: { Authorization: `Bearer ${access}`, "content-type": "application/json" } });
    return res;
}

function sellerOnboarding(access, body) {
    const res = http.post(`${baseURL}/account/seller_profile`,
        body,
        { headers: { Authorization: `Bearer ${access}` } });
    return res;

}

function sellerAgreement(access) {
    const res = http.post(`${baseURL}/account/seller_profile/agreement`,null,
        { headers: { Authorization: `Bearer ${access}` } });
    return res;
}

function sellerPayment(access, body) {
    const res = http.post(`${baseURL}/account/seller_profile/payout_methods`,body,
        { headers: { Authorization: `Bearer ${access}` } });
    return res
}

function removeAccount(access) {
    const res = http.del(`${baseURL}/account`,null, { headers: { Authorization: `Bearer ${access}` } });
    return res;
}

function createOffer(access, body) {
    const res = http.post(`${baseURL}/offers`, JSON.stringify(body),
        { headers: { Authorization: `Bearer ${access}`, "content-type": "application/json" } });
    return res
}

function searchAccountOffers(access, listing_type) {
    const res = http.get(`${baseURL}/account/seller_profile/offers?filter[status]=pending&filter[offer_type]=${listing_type}`,
        { headers: { Authorization: `Bearer ${access}` } });
    return res
}

function acceptOffer(access, offer_id) {
    const res = http.post(`${baseURL}/account/seller_profile/offers/${offer_id}/accept`, null,
        { headers: { Authorization: `Bearer ${access}` } });
    return res
}

function getOrders(access){
    const res = http.get(`${baseURL}/account/orders?filter[status]=unpaid`,
    { headers: { Authorization: `Bearer ${access}` } });
    return res;
}

export default { sendOtp, validateOtpCode, completeOnboarding, completeUserProfile, removeAccount, getProductCategories, getProductSubCategories, getSizeCategories, getSizeChart, getStyles, getProductVariants, getUsedProductVariants, getBrands, getProductVariantDetails, getProductVariantListings, getProductVariantReviews, createProductListing, endProductListing, getSizeItems, sellerOnboarding, sellerAgreement, sellerPayment, searchProductrListing, createOffer, acceptOffer, searchAccountOffers, getOrders, searchProductrListingPage};
