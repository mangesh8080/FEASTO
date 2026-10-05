package com.tka.feasto.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.tka.feasto.dto.PaymentDTO;
import com.tka.feasto.entity.Payment;
import com.tka.feasto.enums.PaymentStatus;
import com.tka.feasto.exception.ResourceNotFoundException;
import com.tka.feasto.mapper.CustomMapper;
import com.tka.feasto.repository.OrderRepository;
import com.tka.feasto.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Value;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import com.tka.feasto.entity.Order;
import com.tka.feasto.enums.PaymentMethod;
import com.tka.feasto.exception.ValidationException;
import com.tka.feasto.repository.UserRepository;
import org.json.JSONObject;
import java.util.Map;

@Service
public class PaymentService {

	@Autowired
	private CustomMapper mapper;

	@Autowired
	private PaymentRepository paymentRepository;

	@Autowired
	private OrderRepository orderRepository;
	
	@Autowired
	private UserRepository userRepository;

	@Autowired
	private RazorpayClient razorpayClient;

	@Value("${razorpay.key.id}")
	private String razorpayKeyId;

	@Value("${razorpay.key.secret}")
	private String razorpayKeySecret;

	public PaymentDTO processPayment(PaymentDTO dto) {
		orderRepository.findById(dto.getOrderId())
				.orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + dto.getOrderId()));
		Payment payment = mapper.toPayment(dto);
	    // Cash on Delivery isn't collected yet — mark it PENDING.
	    // Anything else hitting this basic endpoint is treated as already confirmed.
	    payment.setPaymentStatus(
	            dto.getPaymentMethod() == PaymentMethod.COD ? PaymentStatus.PENDING : PaymentStatus.COMPLETED);
		Payment saved = paymentRepository.save(payment);
		return mapper.toPaymentDTO(saved);
	}

	public PaymentDTO getPaymentById(Long id) {
		Payment payment = paymentRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
		return mapper.toPaymentDTO(payment);
	}
	
	/**
	 * Step 1 of the Razorpay flow: ask Razorpay to create an "order" on their
	 * side for this amount, and hand the frontend everything it needs to open
	 * the checkout popup.
	 */
	public Map<String, Object> createRazorpayOrder(Long orderId, Double amount) {
	    orderRepository.findById(orderId)
	            .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
	    try {
	        JSONObject orderRequest = new JSONObject();
	        // Razorpay expects the amount in the smallest currency unit (paise for INR)
	        orderRequest.put("amount", Math.round(amount * 100));
	        orderRequest.put("currency", "INR");
	        orderRequest.put("receipt", "order_rcpt_" + orderId);

	        com.razorpay.Order razorpayOrder = razorpayClient.orders.create(orderRequest);

	        return Map.of(
	                "razorpayOrderId", razorpayOrder.get("id").toString(),
	                "amount", amount,
	                "currency", "INR",
	                "keyId", razorpayKeyId);
	    } catch (Exception e) {
	        throw new ValidationException("Failed to create Razorpay order: " + e.getMessage());
	    }
	}

	/**
	 * Step 2: verify the signature Razorpay sent back after the user paid.
	 * Only if this matches do we trust the payment and save it as COMPLETED.
	 */
	public PaymentDTO verifyAndSavePayment(PaymentDTO dto, String razorpayOrderId, String razorpayPaymentId,
	        String razorpaySignature) {
	    Order order = orderRepository.findById(dto.getOrderId())
	            .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + dto.getOrderId()));

	    try {
	        JSONObject options = new JSONObject();
	        options.put("razorpay_order_id", razorpayOrderId);
	        options.put("razorpay_payment_id", razorpayPaymentId);
	        options.put("razorpay_signature", razorpaySignature);

	        boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);
	        if (!isValid) {
	            throw new ValidationException("Payment verification failed: signature mismatch");
	        }
	    } catch (ValidationException ve) {
	        throw ve;
	    } catch (Exception e) {
	        throw new ValidationException("Payment verification failed: " + e.getMessage());
	    }

	    Payment payment = new Payment();
	    payment.setOrder(order);
	    payment.setUser(userRepository.findById(dto.getUserId())
	            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + dto.getUserId())));
	    payment.setAmount(dto.getAmount());
	    payment.setPaymentMethod(dto.getPaymentMethod() != null ? dto.getPaymentMethod() : PaymentMethod.ONLINE);
	    payment.setPaymentStatus(PaymentStatus.COMPLETED);
	    payment.setTransactionId(razorpayPaymentId);

	    Payment saved = paymentRepository.save(payment);
	    return mapper.toPaymentDTO(saved);
	}
}