xargs -I % -P 10 curl -X GET -s -I "http://127.0.0.1:5000/categories/MLA1071" < <(printf '%s\n' {1..5000})
