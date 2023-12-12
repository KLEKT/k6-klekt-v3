import { check, sleep } from 'k6';
import api from '/src/api.js';

export default function(data) {
      const product_variants_res = api.getProductVariants(data.access,"nike");
      check(product_variants_res, { 'GET Product variant': (r) => r.status == 200 });
      const product_variant_id = product_variants_res.json().data[0].id
    
      const size_chart_items_res = api.getSizeItems(data.access, product_variant_id);
      check(size_chart_items_res, { 'GET Size chart items': (r) => r.status == 200 });
      const size_item_id = size_chart_items_res.json().data[0].id
      const listing_type = "new_with_defect";
      const listing_res = api.createProductListing(data.access, {
        consignment: false,
        accept_bids: true,
        bid_range: 0,
        condition_description:  "This is a test listing",
        listing_type: listing_type,
        box_condition: "good",
        expiration: 7,
        listing_photos: [
        ],
        listing_defects: [
        ],
        listings: [
          {
            sale_price_cents: 10,
            quantity: 1,
            product_variant_id: product_variant_id,
            size_item_id: size_item_id
          }
        ]
      });
      check(listing_res, { 'POST New Listing': (r) => r.status == 201 });
    
      let listing_search_res = null;
      let listing_id = null;
      while(!listing_id)
      {
        sleep(1);
        listing_search_res = api.searchProductrListing(data.access)
        const listing = listing_search_res.json().data.filter(function(listing) {
          return listing.attributes.listing_type == listing_type;
        });
        if(listing || listing.length > 0)
        {
          listing_id = listing[0].id
        }
      }
      
      check(listing_search_res, { 'GET listings': (r) => r.status == 200 });

      return {listing_id: listing_id, product_variant_id: product_variant_id, size_item_id: size_item_id, listing_type: listing_type};
}