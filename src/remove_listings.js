import { check, sleep } from 'k6';
import api from '/src/api.js';

const get_listing_ids = (access) => {
    const listing_search_res = api.searchProductrListing(access)

    const listings = listing_search_res.json().data

    if(listings.length > 0)
    {
        const listingIds = listings.map(function(listing) {
            return listing.id
        });
    
        check(listing_search_res, { 'Get listings to end 200': (r) => r.status == 200 });
    
        return listingIds;
    }
    else
    {
        return [];
    }
};

export default function(data) {

    let listingIds = get_listing_ids(data.access);
    while(listingIds.length > 0)
    {
        for(let i = 0; i < listingIds.length; i++)
        {
            const listingId = listingIds[i];
            const end_listing_res =  api.endProductListing(data.access, {
                listing_id: listingId
            });
    
            check(end_listing_res, { 'End Listings': (r) => r.status == 201 || r.status == 404});

        }
        sleep(1);
        listingIds = get_listing_ids(data.access);
    }
    
    return;
}
