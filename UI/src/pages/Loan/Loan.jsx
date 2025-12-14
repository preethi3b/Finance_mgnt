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
  HStack,
  Tooltip,
  IconButton,
  Spinner,
  SimpleGrid,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Select,
  Tag,
  TagLabel,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FiPrinter } from "react-icons/fi";
import { showToast } from "../../utils/toast";
import dayjs from "dayjs";

const Loan = () => {
  const [formData, setFormData] = useState({
    mobile: "",
    area: "",
    customer: "",
    loanAmount: "",
    tenure: "",
    interest: "",
    tenureType: "",
  });
  const [errors, setErrors] = useState({});
  const [loan, setLoan] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [loanCount, setLoanCount] = useState([]);
  const [searchdate, setSearchDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLoanCount();
    fetchLoan();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "green";
      case "In Progress":
        return "blue";
      default:
        return "orange";
    }
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.mobile.trim()) newErrors.mobile = "Enter mobile number";
    if (!formData.area.trim()) newErrors.area = "Select area";
    if (!formData.customer.trim()) newErrors.customer = "Select customer";
    if (!formData.loanAmount.trim()) newErrors.loanAmount = "Enter loan amount";
    if (Number(formData.loanAmount) <= 0)
      newErrors.loanAmount = "Loan amount must be greater than 0";
    if (!formData.tenure.trim()) newErrors.tenure = "Enter tenure";
    if (Number(formData.tenure) <= 0)
      newErrors.tenure = "Tenure must be greater than 0";
    if (!formData.interest.trim()) newErrors.interest = "Enter interest %";
    if (Number(formData.interest) <= 0)
      newErrors.interest = "Interest % must be greater than 0";
    if (!formData.tenureType.trim())
      newErrors.tenureType = "Select tenure type";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchLoan = async (page = 1, date = "") => {
    setLoading(true);
    const url = new URL(`${import.meta.env.VITE_API_BASE_URL}/get_service`);
    url.searchParams.append("page", page);
    url.searchParams.append("limit", itemsPerPage);
    if (date) url.searchParams.append("date", date);

    try {
      const response = await fetch(url.toString());
      const json = await response.json();
      if (response.ok) {
        const formatted = json.data.map((item, index) => ({
          id: item.service_id || index + 1,
          service_id: item.service_id,
          serviceNo: item.service_no,
          customerName: item.cus_name,
          mobileModel: item.mob_model,
          mobileNumber: item.mob_no,
          issue: item.issue_details,
          status: item.status,
          date: item.received_date
            ? new Date(item.received_date).toLocaleDateString("en-IN")
            : "N/A",
        }));
        setLoan(formatted);
        setCurrentPage(json.currentPage);
        setTotalPages(json.totalPages);
      } else {
        console.error("Failed to fetch loan");
      }
    } catch (error) {
      console.error("Fetch loan error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoan(currentPage);
  }, [currentPage]);

  const fetchLoanCount = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/get_service_count`
      );
      const data = await response.json();
      if (response.ok) {
        setLoanCount(data);
      } else {
        console.error("Failed to fetch loan count");
      }
    } catch (error) {
      console.error("Fetch loan count error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    if (!validateForm()) {
      showToast({
        title: "Validation Error",
        description: "Please fill all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    showToast({
      title: "Loan Approved",
      description: "Loan details saved successfully",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handlePrint = (id) => {
    console.log("Print loan ID:", id);
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
          <Text className="page-title">Loan</Text>
        </Flex>

        {/* INPUT FORM */}
        <Card className="table-card" p={6} mb={8}>
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
            <FormControl isInvalid={errors.mobile}>
              <FormLabel>Mobile</FormLabel>
              <Input
                name="mobile"
                placeholder="Enter mobile no"
                value={formData.mobile}
                onChange={handleInputChange}
                className="input-primary"
              />
              {errors.mobile && (
                <FormErrorMessage>{errors.mobile}</FormErrorMessage>
              )}
            </FormControl>

            <FormControl isInvalid={errors.area}>
              <FormLabel>Area</FormLabel>
              <Select
                name="area"
                placeholder="Select area"
                value={formData.area}
                onChange={handleInputChange}
                className="input-primary"
              >
                <option value="Thanjavur">Thanjavur</option>
                <option value="Trichy">Trichy</option>
                <option value="Ariyalur">Ariyalur</option>
              </Select>
              {errors.area && (
                <FormErrorMessage>{errors.area}</FormErrorMessage>
              )}
            </FormControl>

            <FormControl isInvalid={errors.customer}>
              <FormLabel>Customer Name</FormLabel>
              <Select
                name="customer"
                placeholder="Select customer"
                value={formData.customer}
                onChange={handleInputChange}
                className="input-primary"
              >
                {/* Dynamic list */}
              </Select>
              {errors.customer && (
                <FormErrorMessage>{errors.customer}</FormErrorMessage>
              )}
            </FormControl>

            <FormControl isInvalid={errors.loanAmount}>
              <FormLabel>Loan Amount</FormLabel>
              <Input
                name="loanAmount"
                placeholder="Enter amount"
                value={formData.loanAmount}
                onChange={handleInputChange}
                className="input-primary"
              />
              {errors.loanAmount && (
                <FormErrorMessage>{errors.loanAmount}</FormErrorMessage>
              )}
            </FormControl>

            <FormControl>
              <FormLabel>Tenure</FormLabel>
              <Input
                name="tenure"
                type="number"
                placeholder="Enter tenure"
                value={formData.tenure}
                onChange={handleInputChange}
                className="input-primary"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Interest %</FormLabel>
              <Input
                name="interest"
                type="number"
                placeholder="Enter interest"
                value={formData.interest}
                onChange={handleInputChange}
                className="input-primary"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Tenure Type</FormLabel>
              <Select
                name="tenureType"
                placeholder="Select type"
                value={formData.tenureType}
                onChange={handleInputChange}
                className="input-primary"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </Select>
            </FormControl>
          </SimpleGrid>

          <Flex mt={6} justify="flex-end" gap={3}>
            <Button
              variant="ghost"
              className="btn-cancel"
              size="sm"
              onClick={() =>
                setFormData({
                  mobile: "",
                  area: "",
                  customer: "",
                  loanAmount: "",
                  tenure: "",
                  interest: "",
                  tenureType: "",
                })
              }
            >
              Cancel
            </Button>
            <Button className="btn-primary" size="sm" onClick={handleApprove}>
              Approve
            </Button>
          </Flex>
        </Card>

        {/* LOAN TABLE */}
        <Card className="table-card">
          <CardHeader className="page-header">
            <Text color="black" fontWeight="500">
              Loan History
            </Text>
            <Input
              type="date"
              size="sm"
              className="input-primary input-small"
              onChange={(e) => {
                const selected = e.target.value;
                setSearchDate(selected);
                setCurrentPage(1);
                fetchLoan(1, selected);
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
                        <Th>S.No</Th>
                        <Th>Customer Name</Th>
                        <Th>Mobile</Th>
                        <Th>Address</Th>
                        <Th>Loan Amount</Th>
                        <Th>Pending Amount</Th>
                        <Th>Loan Date</Th>
                        <Th textAlign="center">Action</Th>
                      </Tr>
                    </Thead>

                    <Tbody>
                      {loan.map((item, index) => (
                        <Tr key={item.id}>
                          <Td>{index + 1}</Td>
                          <Td className="clickable-id">{item.customerName}</Td>
                          <Td>{item.mobileModel}</Td>
                          <Td>{item.mobileNumber}</Td>
                          <Td>{item.issue}</Td>
                          <Td>
                            <Tag
                              colorScheme={getStatusColor(item.status)}
                              size="sm"
                              borderRadius="full"
                            >
                              <TagLabel>{item.status}</TagLabel>
                            </Tag>
                          </Td>
                          <Td>{item.date}</Td>
                          <Td>
                            <Tooltip label="Print" bg="#625DF0" color="white">
                              <IconButton
                                icon={<FiPrinter />}
                                aria-label="Print"
                                size="sm"
                                className="table-action-btn view"
                                onClick={() => handlePrint(item.service_id)}
                              />
                            </Tooltip>
                          </Td>
                        </Tr>
                      ))}

                      {loan.length === 0 && (
                        <Tr>
                          <Td colSpan="8" textAlign="center" color="#666">
                            No recent loan found
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </Box>

                <Flex className="pagination-footer">
                  <Text className="pagination-text">
                    Showing {loan.length} items
                  </Text>

                  <HStack spacing={2}>
                    <Button
                      size="xs"
                      className="pagination-btn"
                      onClick={() => {
                        const newPage = Math.max(currentPage - 1, 1);
                        setCurrentPage(newPage);
                        fetchLoan(newPage, searchdate);
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
                          fetchLoan(i + 1, searchdate);
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
                        fetchLoan(newPage, searchdate);
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

export default Loan;
