/**
 * Tests unitaires pour le service UserService
 */

import { userService } from "@/services/user.service";
import api from "@/lib/axios";

// Mock axios
jest.mock("@/lib/axios");

describe("UserService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("should fetch all users with pagination", async () => {
      const mockResponse = {
        data: [
          { id: 1, first_name: "John", last_name: "Doe" },
          { id: 2, first_name: "Jane", last_name: "Smith" },
        ],
        meta: {
          current_page: 1,
          total: 2,
          per_page: 15,
        },
      };

      (api.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await userService.getAll(1);

      expect(api.get).toHaveBeenCalledWith("/users", { params: { page: 1 } });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getById", () => {
    it("should fetch a user by id", async () => {
      const mockUser = {
        id: 1,
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
      };

      (api.get as jest.Mock).mockResolvedValue({
        data: { success: true, data: mockUser },
      });

      const result = await userService.getById(1);

      expect(api.get).toHaveBeenCalledWith("/users/1");
      expect(result).toEqual(mockUser);
    });

    it("should throw error if user not found", async () => {
      (api.get as jest.Mock).mockResolvedValue({
        data: { success: true, data: null },
      });

      await expect(userService.getById(999)).rejects.toThrow("User not found");
    });
  });

  describe("create", () => {
    it("should create a new user", async () => {
      const userData = {
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        phone: "123456789",
        type: "CUSTOMER",
      };

      const mockCreatedUser = { id: 1, ...userData };

      (api.post as jest.Mock).mockResolvedValue({
        data: { success: true, data: mockCreatedUser },
      });

      const result = await userService.create(userData);

      expect(api.post).toHaveBeenCalledWith("/users", userData);
      expect(result).toEqual(mockCreatedUser);
    });
  });

  describe("update", () => {
    it("should update an existing user", async () => {
      const updateData = { first_name: "Jane" };
      const mockUpdatedUser = { id: 1, first_name: "Jane", last_name: "Doe" };

      (api.put as jest.Mock).mockResolvedValue({
        data: { success: true, data: mockUpdatedUser },
      });

      const result = await userService.update(1, updateData);

      expect(api.put).toHaveBeenCalledWith("/users/1", updateData);
      expect(result).toEqual(mockUpdatedUser);
    });
  });

  describe("delete", () => {
    it("should delete a user", async () => {
      (api.delete as jest.Mock).mockResolvedValue({});

      await userService.delete(1);

      expect(api.delete).toHaveBeenCalledWith("/users/1");
    });
  });
});






