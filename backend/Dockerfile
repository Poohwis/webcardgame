# Start from Go base image
FROM golang:1.22

# Set working directory
WORKDIR /app

# Copy go files
COPY . .

# Build the app
RUN go build -o server .

# Expose the port used in your Go app (usually 8080)
EXPOSE 8080

# Run the app
CMD ["./server"]
