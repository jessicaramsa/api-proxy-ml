xargs -I % -P 10 curl -X GET -s -I "http://35.239.34.151:8080/categories/MLA1071" < <(printf '%s\n' {1..5000})
