How to generate the pin yourself

echo | openssl s_client -servername httpbin.org -connect httpbin.org:443 \
  | openssl x509 -pubkey -noout \
  | openssl pkey -pubin -outform DER \
  | openssl dgst -sha256 -binary \
  | base64