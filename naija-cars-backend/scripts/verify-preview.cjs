const assert=require('node:assert/strict');
const base='http://127.0.0.1:5056/api';
async function request(path,{token,body,method='GET',status=200}={}) {
 const r=await fetch(base+path,{method,headers:{...(token?{Authorization:`Bearer ${token}`} : {}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
 const data=await r.json();assert.equal(r.status,status,`${method} ${path}: ${JSON.stringify(data).slice(0,200)}`);return data.data;
}
async function run(){
 const login=email=>request('/auth/login',{method:'POST',body:{email,password:'PreviewCars2026!'}});
 const buyer=await login('buyer@naijacars.test'),seller=await login('seller@naijacars.test'),admin=await login('admin@naijacars.test');
 const b=buyer.accessToken,s=seller.accessToken,a=admin.accessToken;
 await request('/admin/settings',{token:b,status:403}); console.log('PASS administrator permissions');
 const sale=(await request('/listings?type=SALE&limit=1')).listings[0],rent=(await request('/listings?type=RENT&limit=1')).listings[0];
 assert.equal((await request('/listings/'+sale.id)).listing.listingType,'SALE');assert.equal((await request('/listings/'+rent.id)).listing.listingType,'RENT');console.log('PASS browsing and detail data');
 let fav=await request(`/listings/${sale.id}/favorite`,{method:'POST',token:b});if(!fav.isFavorited)await request(`/listings/${sale.id}/favorite`,{method:'POST',token:b});assert.ok((await request('/users/me/favorites',{token:b})).favorites.some(x=>x.id===sale.id));console.log('PASS persistent saved cars');
 const contactInfo={firstName:'Alex',lastName:'Preview',email:'buyer@naijacars.test',phone:'+2348012345101'};
 const rental=await request('/bookings',{method:'POST',token:b,status:201,body:{listingId:rent.id,bookingType:'rental',rentalDays:4,totalAmount:rent.price*4+5000,paymentMethod:'arrange_with_seller',addons:{},contactInfo}});
 const purchase=await request('/bookings',{method:'POST',token:b,status:201,body:{listingId:sale.id,bookingType:'purchase',totalAmount:Math.round(sale.price*1.01*100)/100,paymentMethod:'arrange_with_seller',addons:{},contactInfo}});
 assert.ok((await request('/bookings/me',{token:b})).bookings.some(x=>x.id===rental.booking.id));assert.ok((await request('/bookings/me',{token:s})).bookings.some(x=>x.id===purchase.booking.id));assert.equal((await request('/bookings/me',{token:a})).bookings.length,0);console.log('PASS rental/purchase persistence and buyer/seller isolation');
 await request('/messages',{method:'POST',token:b,status:201,body:{receiverId:seller.user.id,listingId:sale.id,messageText:'Local preview QA: is this car available for a viewing?'}});
 const conv=(await request('/messages/conversations',{token:s})).conversations.find(c=>c.otherUser.id===buyer.user.id);assert.ok(conv);await request(`/messages/${conv.conversationId}/read`,{method:'PUT',token:s});console.log('PASS messaging and read state');
 await request('/users/profile',{method:'PUT',token:b,body:{firstName:'Alex',lastName:'Preview',about:'Local preview account for NaijaCars verification.'}});assert.match((await request('/auth/me',{token:b})).user.profile.about,/Local preview/);console.log('PASS profile persistence');
 const inquiry=await request('/contact',{method:'POST',status:201,body:{...contactInfo,subject:'Local preview verification',message:'This isolated test checks that contact enquiries persist in the support inbox.'}});assert.ok((await request('/admin/settings/inquiries',{token:a})).inquiries.some(i=>i.id===inquiry.reference));await request('/admin/settings/inquiries/'+inquiry.reference,{method:'PATCH',token:a,body:{resolved:true}});console.log('PASS contact persistence and inbox resolution');
 const created=await request('/listings',{method:'POST',token:s,status:201,body:{listingType:'SALE',make:'Toyota',model:'Corolla QA',year:2022,mileage:0,transmission:'automatic',fuelType:'petrol',condition:'FOREIGN_USED',price:18000000,locationCity:'Lagos',locationState:'Lagos',description:'Isolated preview listing created by verification.',features:['Air Conditioning','Bluetooth']}});assert.deepEqual(created.listing.features,['Air Conditioning','Bluetooth']);assert.equal(created.listing.mileage,0);
 await request('/listings/'+created.listing.id,{method:'PUT',token:s,body:{price:17500000,features:['Air Conditioning']}});assert.equal((await request('/listings/'+created.listing.id)).listing.price,17500000);
 const image=require('fs').readFileSync('../naija-cars-app/public/assets/marketplace-hero.webp').toString('base64');await request('/media/upload-data',{method:'POST',token:s,status:201,body:{listingId:created.listing.id,images:[{imageData:'data:image/webp;base64,'+image}]}});assert.ok((await request('/listings/'+created.listing.id)).listing.media.length);console.log('PASS create/edit listing, persisted features, zero mileage and image upload');
 await request('/listings/'+created.listing.id,{method:'DELETE',token:s});console.log('PASS delete isolated test listing');console.log('FULL PREVIEW API CHECKS PASSED');
}
run().catch(error=>{console.error(error.message);process.exitCode=1});
