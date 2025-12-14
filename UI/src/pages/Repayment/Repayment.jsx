import {
  Box,
  Button,
  Flex,
  Input,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Card,
  CardHeader,
  CardBody,
  Text,
  Spinner,
  SimpleGrid,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Select,
  HStack,
  Tooltip,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { FiPrinter } from "react-icons/fi";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { showToast } from "../../utils/toast";

const Repayment = () => {
  const toast = useToast();

  const [formData, setFormData] = useState({
    loanNo: "",
    customerName: "",
    mobileNumber: "",
    address: "",
    due_amount: "",
    pay_amount: "",
    pending_amount: 0,
    due_date: "",
  });

  const [errors, setErrors] = useState({});
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchDate, setSearchDate] = useState(dayjs().format("YYYY-MM-DD"));
  const itemsPerPage = 10;

  // Fetch repayment records
  const fetchRecords = async (page = 1, date = "") => {
    setLoading(true);
    try {
      const url = new URL(`${import.meta.env.VITE_API_BASE_URL}/get_service`);
      url.searchParams.append("page", page);
      url.searchParams.append("limit", itemsPerPage);
      if (date) url.searchParams.append("date", date);

      const response = await fetch(url.toString());
      const json = await response.json();

      if (response.ok) {
        const formatted = json.data.map((item, index) => ({
          id: item.service_id || index + 1,
          loanNo: item.service_no,
          customerName: item.cus_name,
          mobileNumber: item.mob_no,
          address: item.mob_model,
          due_amount: item.issue_details,
          pay_amount: item.status,
          pending_amount: "—",
          date: item.received_date
            ? new Date(item.received_date).toLocaleDateString("en-IN")
            : "N/A",
        }));
        setRecords(formatted);
        setCurrentPage(json.currentPage);
        setTotalPages(json.totalPages);
      } else {
        console.error("Failed to fetch repayment data");
      }
    } catch (error) {
      console.error("Fetch repayment error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords(currentPage);
  }, [currentPage]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let cleanedValue = value;

    if (name === "mobileNumber") {
      cleanedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    if (["due_amount", "pay_amount"].includes(name)) {
      cleanedValue = value.replace(/[^\d.]/g, "");
    }

    setFormData({ ...formData, [name]: cleanedValue });
    setErrors({ ...errors, [name]: "" });
  };

  useEffect(() => {
    const due = parseFloat(formData.due_amount) || 0;
    const pay = parseFloat(formData.pay_amount) || 0;
    const pending = Math.max(0, (due - pay).toFixed(2));
    setFormData((prev) => ({ ...prev, pending_amount: pending }));
  }, [formData.due_amount, formData.pay_amount]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.loanNo.trim()) newErrors.loanNo = "Enter loan number";
    if (!formData.customerName.trim())
      newErrors.customerName = "Enter customer name";
    if (!formData.mobileNumber.trim())
      newErrors.mobileNumber = "Enter mobile number";
    else if (formData.mobileNumber.length !== 10)
      newErrors.mobileNumber = "Mobile number must be 10 digits";
    if (!formData.address.trim()) newErrors.address = "Enter address";
    if (!formData.due_amount || parseFloat(formData.due_amount) <= 0)
      newErrors.due_amount = "Enter valid due amount";
    if (!formData.pay_amount || parseFloat(formData.pay_amount) < 0)
      newErrors.pay_amount = "Enter valid payment amount";
    if (!formData.due_date) newErrors.due_date = "Select due date";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePay = async () => {
    if (!validateForm()) {
      showToast({
        title: "Validation Error",
        description: "Please fix the highlighted fields.",
        status: "error",
      });
      return;
    }

    const payload = {
      loan_no: formData.loanNo,
      cus_name: formData.customerName,
      mobile: formData.mobileNumber,
      address: formData.address,
      due_amount: parseFloat(formData.due_amount),
      pay_amount: parseFloat(formData.pay_amount),
      pending_amount: parseFloat(formData.pending_amount),
      due_date: formData.due_date,
    };

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/repayment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (response.ok) {
        showToast({
          title: "Payment Saved",
          description: data.message || "Repayment recorded successfully.",
          status: "success",
        });
        setFormData({
          loanNo: "",
          customerName: "",
          mobileNumber: "",
          address: "",
          due_amount: "",
          pay_amount: "",
          pending_amount: 0,
          due_date: "",
        });
        fetchRecords(currentPage);
      } else {
        showToast({
          title: "Save Failed",
          description: data.message || "Failed to save repayment.",
          status: "error",
        });
      }
    } catch (err) {
      showToast({
        title: "Error",
        description: err.message,
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (id) => {
    console.log("Print ID:", id);
  };

  return (
    <>
      {loading && (
        <Box className="loading-overlay">
          <Spinner size="xl" color="#625DF0" thickness="4px" />
          <Text className="loading-text">
            Retrieving records, please wait...
          </Text>
        </Box>
      )}

      <Box overflow="hidden">
        {/* HEADER */}
        <Flex className="page-header">
          <Text className="page-title">Repayment</Text>
        </Flex>

        {/* INPUT FORM */}
        <Card className="table-card" p={6} mb={8}>
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
            <FormControl isInvalid={errors.loanNo}>
              <FormLabel>Loan No</FormLabel>
              <Input
                name="loanNo"
                placeholder="Enter loan no"
                value={formData.loanNo}
                onChange={handleInputChange}
                className="input-primary"
              />
              {errors.loanNo && (
                <FormErrorMessage>{errors.loanNo}</FormErrorMessage>
              )}
            </FormControl>

            <FormControl isInvalid={errors.mobileNumber}>
              <FormLabel>Mobile</FormLabel>
              <Input
                name="mobileNumber"
                placeholder="Enter mobile no"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                className="input-primary"
              />
              {errors.mobileNumber && (
                <FormErrorMessage>{errors.mobileNumber}</FormErrorMessage>
              )}
            </FormControl>

            <FormControl isInvalid={errors.address}>
              <FormLabel>Area / Address</FormLabel>
              <Select
                name="address"
                placeholder="Select area"
                value={formData.address}
                onChange={handleInputChange}
                className="input-primary"
              >
                <option value="Thanjavur">Thanjavur</option>
                <option value="Trichy">Trichy</option>
                <option value="Ariyalur">Ariyalur</option>
              </Select>
              {errors.address && (
                <FormErrorMessage>{errors.address}</FormErrorMessage>
              )}
            </FormControl>

            <FormControl isInvalid={errors.customerName}>
              <FormLabel>Customer Name</FormLabel>
              <Input
                name="customerName"
                placeholder="Enter customer name"
                value={formData.customerName}
                onChange={handleInputChange}
                className="input-primary"
              />
              {errors.customerName && (
                <FormErrorMessage>{errors.customerName}</FormErrorMessage>
              )}
            </FormControl>

            <FormControl isInvalid={errors.due_amount}>
              <FormLabel>Due Amount</FormLabel>
              <Input
                name="due_amount"
                placeholder="Enter due amount"
                value={formData.due_amount}
                onChange={handleInputChange}
                className="input-primary"
              />
              {errors.due_amount && (
                <FormErrorMessage>{errors.due_amount}</FormErrorMessage>
              )}
            </FormControl>

            <FormControl isInvalid={errors.pay_amount}>
              <FormLabel>Pay Amount</FormLabel>
              <Input
                name="pay_amount"
                placeholder="Enter pay amount"
                value={formData.pay_amount}
                onChange={handleInputChange}
                className="input-primary"
              />
              {errors.pay_amount && (
                <FormErrorMessage>{errors.pay_amount}</FormErrorMessage>
              )}
            </FormControl>

            <FormControl isInvalid={errors.pending_amount}>
              <FormLabel>Pending</FormLabel>
              <Input
                name="pending_amount"
                value={formData.pending_amount}
                readOnly
                className="input-primary"
              />
            </FormControl>

            <FormControl isInvalid={errors.due_date}>
              <FormLabel>Due Date</FormLabel>
              <Input
                name="due_date"
                type="date"
                value={formData.due_date}
                onChange={handleInputChange}
                className="input-primary"
              />
              {errors.due_date && (
                <FormErrorMessage>{errors.due_date}</FormErrorMessage>
              )}
            </FormControl>
          </SimpleGrid>

          <Flex mt={6} justify="flex-end" gap={3}>
            <Button
              variant="ghost"
              className="btn-cancel"
              size="sm"
              onClick={() =>
                setFormData({
                  loanNo: "",
                  customerName: "",
                  mobileNumber: "",
                  address: "",
                  due_amount: "",
                  pay_amount: "",
                  pending_amount: 0,
                  due_date: "",
                })
              }
            >
              Cancel
            </Button>
            <Button className="btn-primary" size="sm" onClick={handlePay}>
              Pay
            </Button>
          </Flex>
        </Card>

        {/* TABLE */}
        <Card className="table-card">
          <CardHeader className="page-header">
            <Text color="black" fontWeight="500">
              Repayment History
            </Text>

            <Input
              type="date"
              size="sm"
              className="input-primary input-small"
              onChange={(e) => {
                const selected = e.target.value;
                setSearchDate(selected);
                setCurrentPage(1);
                fetchRecords(1, selected);
              }}
            />
          </CardHeader>

          <CardBody px={0}>
            {loading ? (
              <Flex justify="center" align="center" minH="200px">
                <Spinner size="xl" color="#625DF0" thickness="4px" />
              </Flex>
            ) : (
              <>
                <Box className="table-scroll">
                  <Table className="table" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Loan No</Th>
                        <Th>Customer</Th>
                        <Th>Mobile</Th>
                        <Th>Area</Th>
                        <Th>Due Amount</Th>
                        <Th>Pay Amount</Th>
                        <Th>Pending</Th>
                        <Th>Date</Th>
                        <Th textAlign="center">Action</Th>
                      </Tr>
                    </Thead>

                    <Tbody>
                      {records.map((item) => (
                        <Tr key={item.id}>
                          <Td>{item.loanNo}</Td>
                          <Td>{item.customerName}</Td>
                          <Td>{item.mobileNumber}</Td>
                          <Td>{item.address}</Td>
                          <Td>{item.due_amount}</Td>
                          <Td>{item.pay_amount}</Td>
                          <Td>{item.pending_amount}</Td>
                          <Td>{item.date}</Td>
                          <Td textAlign="center">
                            <Tooltip label="Print" bg="#625DF0" color="white">
                              <IconButton
                                icon={<FiPrinter />}
                                aria-label="Print"
                                size="sm"
                                className="table-action-btn view"
                                onClick={() => handlePrint(item.id)}
                              />
                            </Tooltip>
                          </Td>
                        </Tr>
                      ))}

                      {records.length === 0 && (
                        <Tr>
                          <Td colSpan={9} textAlign="center" color="#666">
                            No repayment records found
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </Box>

                {/* PAGINATION */}
                <Flex className="pagination-footer">
                  <Text className="pagination-text">
                    Showing {records.length} items
                  </Text>

                  <HStack spacing={2}>
                    <Button
                      size="xs"
                      className="pagination-btn"
                      onClick={() => {
                        const newPage = Math.max(currentPage - 1, 1);
                        setCurrentPage(newPage);
                        fetchRecords(newPage, searchDate);
                      }}
                      isDisabled={currentPage === 1}
                    >
                      Prev
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => (
                      <Button
                        key={i}
                        size="xs"
                        className={`pagination-btn ${
                          currentPage === i + 1 ? "active" : ""
                        }`}
                        onClick={() => {
                          setCurrentPage(i + 1);
                          fetchRecords(i + 1, searchDate);
                        }}
                      >
                        {i + 1}
                      </Button>
                    ))}

                    <Button
                      size="xs"
                      className="pagination-btn"
                      onClick={() => {
                        const newPage = Math.min(currentPage + 1, totalPages);
                        setCurrentPage(newPage);
                        fetchRecords(newPage, searchDate);
                      }}
                      isDisabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </HStack>
                </Flex>
              </>
            )}
          </CardBody>
        </Card>
      </Box>
    </>
  );
};

export default Repayment;
