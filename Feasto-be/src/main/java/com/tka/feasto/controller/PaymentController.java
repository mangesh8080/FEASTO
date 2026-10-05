package com.tka.feasto.controller;

import org.springframework.beans.factory.annotation.Autowired;
import com.tka.feasto.enums.PaymentMethod;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tka.feasto.dto.PaymentDTO;
import com.tka.feasto.service.PaymentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentDTO> processPayment(@Valid @RequestBody PaymentDTO dto) {
        return ResponseEntity.ok(paymentService.processPayment(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentDTO> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @PostMapping("/quick-commerce")
    public ResponseEntity<PaymentDTO> processQuickCommercePayment(@Valid @RequestBody PaymentDTO dto) {
        return ResponseEntity.ok(paymentService.processPayment(dto));
    }
    
 // Step 1: frontend calls this before opening the Razorpay checkout popup.
 // Body: { "orderId": 5, "amount": 450.0 }
 @PostMapping("/create-order")
 public ResponseEntity<Map<String, Object>> createOrder(@RequestBody Map<String, Object> body) {
     Long orderId = Long.valueOf(body.get("orderId").toString());
     Double amount = Double.valueOf(body.get("amount").toString());
     return ResponseEntity.ok(paymentService.createRazorpayOrder(orderId, amount));
 }

 // Step 2: frontend calls this after the Razorpay popup succeeds, with the
 // 3 values Razorpay handed back, plus the usual payment details.
 @PostMapping("/verify")
 public ResponseEntity<PaymentDTO> verifyPayment(@RequestBody Map<String, Object> body) {
     PaymentDTO dto = new PaymentDTO();
     dto.setOrderId(Long.valueOf(body.get("orderId").toString()));
     dto.setUserId(Long.valueOf(body.get("userId").toString()));
     dto.setAmount(Double.valueOf(body.get("amount").toString()));
     if (body.get("paymentMethod") != null) {
         dto.setPaymentMethod(PaymentMethod.valueOf(body.get("paymentMethod").toString()));
     }

     String razorpayOrderId = body.get("razorpayOrderId").toString();
     String razorpayPaymentId = body.get("razorpayPaymentId").toString();
     String razorpaySignature = body.get("razorpaySignature").toString();

     return ResponseEntity.ok(
             paymentService.verifyAndSavePayment(dto, razorpayOrderId, razorpayPaymentId, razorpaySignature));
 }
}