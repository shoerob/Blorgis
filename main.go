package main

import (
	"net/http"

	"google.golang.org/appengine"
)

func main() {
	fs := http.FileServer(http.Dir("www"))
	http.Handle("/", fs)
	appengine.Main()
}
