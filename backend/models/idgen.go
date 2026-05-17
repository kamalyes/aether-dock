package models

import (
	"crypto/rand"
	"fmt"
	"time"
)

func NewID() string {
	b := make([]byte, 8)
	rand.Read(b)
	return fmt.Sprintf("%x", b)
}

func NewTimestampID() string {
	return fmt.Sprintf("%d", time.Now().UnixNano())
}
