package com.tka.feasto.mapper;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import com.tka.feasto.dto.AddressDTO;
import com.tka.feasto.dto.DeliveryPartnerDTO;
import com.tka.feasto.dto.LocationDTO;
import com.tka.feasto.dto.LoyaltyProgramDTO;
import com.tka.feasto.dto.MenuItemDTO;
import com.tka.feasto.dto.NotificationDTO;
import com.tka.feasto.dto.OrderDTO;
import com.tka.feasto.dto.OrderItemDTO;
import com.tka.feasto.dto.PaymentDTO;
import com.tka.feasto.dto.RestaurantDTO;
import com.tka.feasto.dto.ReviewDTO;
import com.tka.feasto.dto.UserDTO;
import com.tka.feasto.dto.UserRegistrationDTO;
import com.tka.feasto.entity.Address;
import com.tka.feasto.entity.DeliveryPartner;
import com.tka.feasto.entity.Location;
import com.tka.feasto.entity.LoyaltyProgram;
import com.tka.feasto.entity.MenuItem;
import com.tka.feasto.entity.Notification;
import com.tka.feasto.entity.Order;
import com.tka.feasto.entity.OrderItem;
import com.tka.feasto.entity.Payment;
import com.tka.feasto.entity.Restaurant;
import com.tka.feasto.entity.Review;
import com.tka.feasto.entity.User;

@Component
public class CustomMapper {

    private final ModelMapper modelMapper;

    public CustomMapper() {
        this.modelMapper = new ModelMapper();

    }

    public UserDTO toUserDTO(User user) {
        return modelMapper.map(user, UserDTO.class);
    }

    public User toUser(UserDTO userDTO) {
        return modelMapper.map(userDTO, User.class);
    }

    public RestaurantDTO toRestaurantDTO(Restaurant restaurant) {
        return modelMapper.map(restaurant, RestaurantDTO.class);
    }

    public Restaurant toRestaurant(RestaurantDTO restaurantDTO) {
        return modelMapper.map(restaurantDTO, Restaurant.class);
    }

    public MenuItem toMenuItem(MenuItemDTO menuItemDTO) {
        return modelMapper.map(menuItemDTO, MenuItem.class);
    }

    public MenuItemDTO toMenuItemDTO(MenuItem menuItem) {
        return modelMapper.map(menuItem, MenuItemDTO.class);
    }

    // Manual mapping from OrderDTO to Order entity
    public Order toOrderEntity(OrderDTO dto, User user, Restaurant restaurant) {
        Order order = new Order();
        order.setOrderId(dto.getOrderId());
        order.setUser(user);
        order.setRestaurant(restaurant);
        // DeliveryPartner can be set if needed
        order.setOrderStatus(dto.getOrderStatus());
        order.setTotalAmount(dto.getTotalAmount());
        order.setDeliveryAddress(dto.getDeliveryAddress());
        order.setOrderTime(dto.getOrderTime());
        order.setDeliveryTime(dto.getDeliveryTime());
        if (dto.getOrderItems() != null) {
            List<OrderItem> items = dto.getOrderItems().stream()
                    .map(this::toOrderItemEntity)
                    .collect(java.util.stream.Collectors.toList());
            order.setOrderItems(items);
        }
        return order;
    }

    // Manual mapping from OrderItemDTO to OrderItem entity
    private OrderItem toOrderItemEntity(OrderItemDTO dto) {
        OrderItem item = new OrderItem();
        item.setOrderItemId(dto.getOrderItemId());
        // Order will be set after saving parent
        if (dto.getMenuItemId() != null) {
            com.tka.feasto.entity.MenuItem menuItem = new com.tka.feasto.entity.MenuItem();
            menuItem.setMenuItemId(dto.getMenuItemId());
            item.setMenuItem(menuItem);
        }
        item.setQuantity(dto.getQuantity());
        item.setPrice(dto.getPrice());
        return item;
    }

    // Manual mapping from Order entity to OrderDTO
    public OrderDTO toOrderDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setOrderId(order.getOrderId());
        dto.setUserId(order.getUser() != null ? order.getUser().getUserId() : null);
        dto.setRestaurantId(order.getRestaurant() != null ? order.getRestaurant().getRestaurantId() : null);
        dto.setDeliveryPartnerId(
                order.getDeliveryPartner() != null ? order.getDeliveryPartner().getDeliveryPartnerId() : null);
        dto.setOrderStatus(order.getOrderStatus());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setDeliveryAddress(order.getDeliveryAddress());
        dto.setOrderTime(order.getOrderTime());
        dto.setDeliveryTime(order.getDeliveryTime());
        if (order.getOrderItems() != null) {
            List<com.tka.feasto.dto.OrderItemDTO> items = order.getOrderItems().stream()
                    .map(this::toOrderItemDTO)
                    .collect(java.util.stream.Collectors.toList());
            dto.setOrderItems(items);
        }
        return dto;
    }

    // Manual mapping from OrderItem entity to OrderItemDTO
    private OrderItemDTO toOrderItemDTO(OrderItem item) {
        OrderItemDTO dto = new OrderItemDTO();
        dto.setOrderItemId(item.getOrderItemId());
        dto.setOrderId(item.getOrder() != null ? item.getOrder().getOrderId() : null);
        dto.setMenuItemId(item.getMenuItem() != null ? item.getMenuItem().getMenuItemId() : null);
        dto.setQuantity(item.getQuantity());
        dto.setPrice(item.getPrice());
        return dto;
    }

    public OrderItem toOrderItem(OrderItemDTO orderItemDTO) {
        return modelMapper.map(orderItemDTO, OrderItem.class);
    }

    public DeliveryPartnerDTO toDeliveryPartnerDTO(DeliveryPartner deliveryPartner) {
        return modelMapper.map(deliveryPartner, DeliveryPartnerDTO.class);
    }

    public DeliveryPartner toDeliveryPartner(DeliveryPartnerDTO deliveryPartnerDTO) {
        return modelMapper.map(deliveryPartnerDTO, DeliveryPartner.class);
    }

    public ReviewDTO toReviewDTO(Review review) {
        return modelMapper.map(review, ReviewDTO.class);
    }

    public Review toReview(ReviewDTO reviewDTO) {
        return modelMapper.map(reviewDTO, Review.class);
    }

    public AddressDTO toAddressDTO(Address address) {
        return modelMapper.map(address, AddressDTO.class);
    }

    public Address toAddress(AddressDTO addressDTO) {
        return modelMapper.map(addressDTO, Address.class);
    }

    public PaymentDTO toPaymentDTO(Payment payment) {
        return modelMapper.map(payment, PaymentDTO.class);
    }

    public Payment toPayment(PaymentDTO paymentDTO) {
        return modelMapper.map(paymentDTO, Payment.class);
    }

    public LoyaltyProgramDTO toLoyaltyProgramDTO(LoyaltyProgram loyaltyProgram) {
        return modelMapper.map(loyaltyProgram, LoyaltyProgramDTO.class);
    }

    public LoyaltyProgram toLoyaltyProgram(LoyaltyProgramDTO loyaltyProgramDTO) {
        return modelMapper.map(loyaltyProgramDTO, LoyaltyProgram.class);
    }

    public LocationDTO toLocationDTO(Location location) {
        return modelMapper.map(location, LocationDTO.class);
    }

    public Location toLocation(LocationDTO locationDTO) {
        return modelMapper.map(locationDTO, Location.class);
    }

    public NotificationDTO toNotificationDTO(Notification n) {
        return modelMapper.map(n, NotificationDTO.class);
    }

    public Notification toNotificationEntity(NotificationDTO dto) {
        return modelMapper.map(dto, Notification.class);
    }

    // Add more as needed for other DTOs like UserRegistrationDTO
    public User toUserFromRegistration(UserRegistrationDTO dto) {
        return modelMapper.map(dto, User.class);
    }
}