import {
  FormikErrors,
  FormikValues,
  FormikHandlers,
  Formik,
  Field,
} from "formik";
import {
  Form,
  Upload,
  message,
  Input,
  Card,
  Checkbox,
  Select,
  Row,
  Col,
  Button,
  UploadProps,
  SelectProps,
  List,
} from "antd";
import { useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import "./styles/CustomQuill.css";
import { UploadOutlined, CloseOutlined } from "@ant-design/icons";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const { TextArea } = Input;

const toErrorString = (err: unknown): string | undefined => {
  if (typeof err === "string") return err; // plain message
  if (Array.isArray(err)) return err.join(", "); // ["A","B"] → "A, B"
  return undefined; // nested object → ignore
};

type StepProps = {
  errors: FormikErrors<FormikValues>;
  values: FormikValues;
  handleChange: FormikHandlers["handleChange"];
  setFieldValue: (field: string, value: any) => void;
};

const getBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const JobDetails = ({
  errors,
  values,
  handleChange,
  setFieldValue,
}: StepProps) => {
  const [form] = Form.useForm();

  const [skills, setSkills] = useState([]);
  const [fileList, setFileList] = useState([]);

  const [testType, setTestType] = useState([]);
  const [seasonType, setSeasonType] = useState("");
  const [interviewType, setInterviewType] = useState([]);
  const [programs, setPrograms] = useState<SelectProps["options"]>([]);
  let testTypeOptions: any = [];
  let interviewTypeOptions: any = [];
  const programsOptions: SelectProps["options"] = [];

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleFileChange = async (info: any) => {
    if (info.file.status !== "uploading") {
      console.log("Uploading:", info.file, info.fileList);
    }
    if (info.file.status === "done") {
      const file = info.file.originFileObj;
      try {
        const base64String = await getBase64(file);
        const files = values.attachments;
        files.push(base64String);
        setFieldValue("attachments", files);
        console.log(values.attachments);
        message.success(`${info.file.name} file uploaded successfully`);
      } catch (error) {
        message.error("File conversion to Base64 failed.");
      }
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }

    setFileList(info.fileList);
  };

  const handleSkillChange = (newSkills: string[]) => {
    setSkills(newSkills);
    setFieldValue("skills", newSkills);
  };

  useEffect(() => {
    axios.get(`${baseUrl}/api/v1/jaf`).then((res) => {
      res.data.testTypes.map((it: any) => {
        testTypeOptions.push({ value: it, label: it });
      });
      setTestType(testTypeOptions);
      res.data.interviewTypes.map((it: any) => {
        interviewTypeOptions.push({ value: it, label: it });
      });
      setInterviewType(interviewTypeOptions);

      const matchingSeason = res.data.seasons.find(
        (season) => season.id === values.seasonId,
      );

      if (matchingSeason) {
        setSeasonType(matchingSeason.type);
      }
      res.data.programs.map((it: any) => {
        programsOptions.push({
          value: it.id,
          label: `${it.branch} - ${it.course} - ${it.year}`,
        });
      });
      setPrograms(programsOptions);
    });
  }, []);

  return (
    <Form
      layout="vertical"
      form={form}
      initialValues={{
        tests: [{ type: "APTITUDE", duration: "" }],
        interviews: [{ type: "TECHNICAL", duration: "" }],
        salaries: [{}],
      }}
      onValuesChange={() => {
        setFieldValue("interviews", form.getFieldsValue().interviews);
        setFieldValue("tests", form.getFieldsValue().tests);
        const norm = form.getFieldsValue().salaries.map((s: any) => ({
          salaryPeriod: s.salaryPeriod ?? "",
          programs: s.programs ?? [],
          genders: s.genders ?? [],
          categories: s.categories ?? [],
          isBacklogAllowed: s.isBacklogAllowed ?? "",
          minCPI: s.minCPI ?? 0,
          tenthMarks: s.tenthMarks ?? 0,
          twelthMarks: s.twelthMarks ?? 0,
          baseSalary: s.baseSalary ?? 0,
          totalCTC: s.totalCTC ?? 0,
          takeHomeSalary: s.takeHomeSalary ?? 0,
          grossSalary: s.grossSalary ?? 0,
          joiningBonus: s.joiningBonus ?? 0,
          performanceBonus: s.performanceBonus ?? 0,
          relocation: s.relocation ?? 0,
          bondAmount: s.bondAmount ?? 0,
          esopAmount: s.esopAmount ?? 0,
          esopVestPeriod: s.esopVestPeriod ?? "",
          firstYearCTC: s.firstYearCTC ?? 0,
          retentionBonus: s.retentionBonus ?? 0,
          deductions: s.deductions ?? 0,
          medicalAllowance: s.medicalAllowance ?? 0,
          bondDuration: s.bondDuration ?? "",
          foreignCurrencyCTC: s.foreignCurrencyCTC ?? 0,
          foreignCurrencyCode: s.foreignCurrencyCode ?? "",
          otherCompensations: s.otherCompensations ?? 0,
          others: s.others ?? "",
          stipend: s.stipend ?? 0,
          foreignCurrencyStipend: s.foreignCurrencyStipend ?? 0,
          accommodation: s.accommodation ?? 0,
          tentativeCTC: s.tentativeCTC ?? 0,
          PPOConfirmationDate: s.PPOConfirmationDate ?? null,
        }));
        setFieldValue("salaries", norm);
      }}
    >
      <h1 className="text-xl">Job Details</h1>
      <Row gutter={24}>
        {/* Job Title (required) */}
        <Col span={24}>
          <Form.Item
            label="Job Title"
            required
            hasFeedback
            validateStatus={toErrorString(errors.role) ? "error" : undefined}
            help={toErrorString(errors.role)}
          >
            <Input
              name="role"
              placeholder="Job Title"
              value={values.role}
              onChange={handleChange}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item label="Offer Letter Date">
            <Input
              type="date"
              name="offerLetterReleaseDate"
              value={values.offerLetterReleaseDate}
              onChange={handleChange}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label="Tentative Joining Date">
            <Input
              type="date"
              name="joiningDate"
              value={values.joiningDate}
              onChange={handleChange}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={24}>
        {/* Location (required) */}
        <Col span={12}>
          <Form.Item
            label="Location"
            required
            hasFeedback
            validateStatus={
              toErrorString(errors.location) ? "error" : undefined
            }
            help={toErrorString(errors.location)}
          >
            <Input
              name="location"
              placeholder="City / Remote"
              value={values.location}
              onChange={handleChange}
            />
          </Form.Item>
        </Col>

        {/* Expected hires (optional but numeric) */}
        <Col span={12}>
          <Form.Item
            label="Expected number of Hires"
            validateStatus={
              toErrorString(errors.expectedNoOfHires) ? "error" : undefined
            }
            help={toErrorString(errors.expectedNoOfHires)}
          >
            <Input
              type="number"
              name="expectedNoOfHires"
              value={values.expectedNoOfHires}
              onChange={handleChange}
              min={0}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            label="Minimum number of Hires"
            validateStatus={
              toErrorString(errors.minNoOfHires) ? "error" : undefined
            }
            help={toErrorString(errors.minNoOfHires)}
          >
            <Input
              type="number"
              name="minNoOfHires"
              value={values.minNoOfHires}
              onChange={handleChange}
              min={0}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={24}>
          <Form.Item
            label="Skills"
            validateStatus={toErrorString(errors.skills) ? "error" : undefined}
            help={toErrorString(errors.skills)}
          >
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="Enter a skill and press Enter"
              value={values.skills}
              onChange={(newSkills) => {
                setFieldValue("skills", newSkills);
                setSkills(newSkills);
              }}
            />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item
        label="Description"
        className="my-3"
        validateStatus={toErrorString(errors.description) ? "error" : undefined}
        help={toErrorString(errors.description)}
      >
        <Field name="description">
          {() => (
            <ReactQuill
              value={values.description}
              onChange={(html) => setFieldValue("description", html)}
              placeholder="Enter the description here..."
              className="custom-quill"
            />
          )}
        </Field>
      </Form.Item>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            label="Attachments"
            validateStatus={
              toErrorString(errors.attachments) ? "error" : undefined
            }
            help={toErrorString(errors.attachments)}
          >
            <Upload fileList={fileList} onChange={handleFileChange}>
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </Form.Item>
        </Col>
      </Row>
      <Form.Item
        label="Other Details"
        validateStatus={toErrorString(errors.others) ? "error" : undefined}
        help={toErrorString(errors.others)}
      >
        <TextArea
          rows={4}
          name="others"
          onChange={handleChange}
          value={values.others}
        />
      </Form.Item>
      {/* ───────── Selection Procedure ───────── */}
      <h1 className="text-xl">Selection Procedure</h1>
      <Row gutter={24}>
        {/* Selection Mode (required) */}
        <Col span={8}>
          <Form.Item
            label="Selection Mode"
            required
            hasFeedback
            validateStatus={
              toErrorString(errors.selectionMode) ? "error" : undefined
            }
            help={toErrorString(errors.selectionMode)}
          >
            <Select
              value={values.selectionMode || undefined}
              placeholder="Please select"
              onChange={(val) => setFieldValue("selectionMode", val)}
              options={[
                { value: "ONLINE", label: "Online" },
                { value: "OFFLINE", label: "Offline" },
                { value: "HYBRID", label: "Hybrid" },
              ]}
            />
          </Form.Item>
        </Col>

        {/* Booleans: required by DTO, but no asterisk needed */}
        <Col span={8} className="mt-auto mb-auto">
          <Checkbox
            checked={values.shortlistFromResume}
            onChange={(e) =>
              setFieldValue("shortlistFromResume", e.target.checked)
            }
          >
            Shortlist From Resume
          </Checkbox>
        </Col>

        <Col span={8} className="mt-auto mb-auto">
          <Checkbox
            checked={values.groupDiscussion}
            onChange={(e) => setFieldValue("groupDiscussion", e.target.checked)}
          >
            Group Discussion
          </Checkbox>
        </Col>
      </Row>
      {/* ───────── Tests ───────── */}
      <h2 className="text-sm">Tests</h2>
      <Form.List name="tests">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => (
              <Card
                size="small"
                title={`Test ${field.name + 1}`}
                key={field.key}
                extra={<CloseOutlined onClick={() => remove(field.name)} />}
              >
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      label="Type"
                      name={[field.name, "type"]}
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <Select placeholder="Please select" options={testType} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Duration"
                      name={[field.name, "duration"]}
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <Input placeholder="Duration" />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            ))}

            <Button type="dashed" onClick={() => add()} block>
              + Add Test
            </Button>

          
          </>
        )}
      </Form.List>
      {/* ───────── Interviews ───────── */}
      <h2 className="text-sm mt-10">Interviews</h2>
      <Form.List name="interviews">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => (
              <Card
                size="small"
                title={`Interview ${field.name + 1}`}
                key={field.key}
                extra={<CloseOutlined onClick={() => remove(field.name)} />}
              >
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      label="Type"
                      name={[field.name, "type"]}
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <Select
                        placeholder="Please select"
                        options={interviewType}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Duration"
                      name={[field.name, "duration"]}
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <Input placeholder="Duration" />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            ))}

            <Button type="dashed" onClick={() => add()} block>
              + Add Interview
            </Button>

           
          </>
        )}
      </Form.List>
      {/* ───────── Requirements (optional) ───────── */}
      <h2 className="text-sm mt-10">Requirements</h2>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            label="Number Of Members"
            validateStatus={
              toErrorString(errors.numberOfMembers) ? "error" : undefined
            }
            help={toErrorString(errors.numberOfMembers)}
          >
            <Input
              type="number"
              name="numberOfMembers"
              placeholder="Number Of Members"
              value={values.numberOfMembers}
              onChange={handleChange}
              min={0}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Number Of Rooms"
            validateStatus={
              toErrorString(errors.numberOfRooms) ? "error" : undefined
            }
            help={toErrorString(errors.numberOfRooms)}
          >
            <Input
              type="number"
              name="numberOfRooms"
              placeholder="Number Of Rooms"
              value={values.numberOfRooms}
              onChange={handleChange}
              min={0}
            />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item
        label="Other Requirements"
        validateStatus={
          toErrorString(errors.otherRequirements) ? "error" : undefined
        }
        help={toErrorString(errors.otherRequirements)}
      >
        <TextArea
          rows={4}
          name="otherRequirements"
          placeholder="Other Requirements"
          value={values.otherRequirements}
          onChange={handleChange}
        />
      </Form.Item>
      <h1 className="text-xl">Salary</h1>
      <Form.List name="salaries">
        {(fields, { add, remove }) => (
          <div style={{ display: "flex", rowGap: 16, flexDirection: "column" }}>
            {fields.map((field) => (
              <Card
                size="small"
                title={`Salary ${field.name + 1}`}
                key={field.key}
                extra={
                  <CloseOutlined
                    onClick={() => {
                      remove(field.name);
                    }}
                  />
                }
              >
                <h2 className="text-sm ">Criteria</h2>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item label="Programs" name={[field.name, "programs"]}>
                      <Select
                        mode="multiple"
                        placeholder="Please Select"
                        options={programs}
                      ></Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Genders" name={[field.name, "genders"]}>
                      <Select
                        mode="multiple"
                        placeholder="Please select"
                        options={[
                          { value: "MALE", label: "Male" },
                          { value: "FEMALE", label: "Female" },
                          { value: "OTHER", label: "Other" },
                        ]}
                      ></Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      label="Categories"
                      name={[field.name, "categories"]}
                    >
                      <Select
                        mode="multiple"
                        placeholder="Please select"
                        options={[
                          { value: "GENERAL", label: "General" },
                          { value: "SC", label: "SC" },
                          { value: "ST", label: "ST" },
                          { value: "OBC", label: "OBC" },
                          { value: "PWD", label: "PWD" },
                        ]}
                      ></Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Backlogs"
                      name={[field.name, "isBacklogAllowed"]}
                      required // ← shows the red asterisk
                      rules={[{ required: true, message: "Required" }]} // validation & inline help
                    >
                      <Select
                        placeholder="Please select"
                        options={[
                          { value: "PREVIOUS", label: "No Active Backlogs" },
                          { value: "NEVER", label: "No Backlogs at All" },
                          { value: "ACTIVE", label: "Doesn't Matter" },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      label="Tenth Marks"
                      name={[field.name, "tenthMarks"]}
                    >
                      <Input placeholder="Tenth Marks" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Twelveth Marks"
                      name={[field.name, "twelvethMarks"]}
                    >
                      <Input placeholder="Twelveth Marks" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item label="Min CPI" name={[field.name, "minCPI"]}>
                      <Input placeholder="Min CPI" />
                    </Form.Item>
                  </Col>
                </Row>
                {seasonType === "PLACEMENT" ? (
                  <>
                    <h2 className="text-sm">Placement Details</h2>
                    <Row gutter={24}>
                      <Col span={12}>
                        <Form.Item
                          label="Base Salary"
                          name={[field.name, "baseSalary"]}
                        >
                          <Input type="number" placeholder="Base Salary" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Total CTC"
                          name={[field.name, "totalCTC"]}
                        >
                          <Input type="number" placeholder="Total CTC" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={24}>
                      <Col span={12}>
                        <Form.Item
                          label="Take Home Salary"
                          name={[field.name, "takeHomeSalary"]}
                        >
                          <Input type="number" placeholder="Take Home Salary" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Gross Salary"
                          name={[field.name, "grossSalary"]}
                        >
                          <Input type="number" placeholder="Gross Salary" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={24}>
                      <Col span={12}>
                        <Form.Item
                          label="Joining Bonus"
                          name={[field.name, "joiningBonus"]}
                        >
                          <Input type="number" placeholder="Joining Bonus" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Performance Bonus"
                          name={[field.name, "performanceBonus"]}
                        >
                          <Input
                            type="number"
                            placeholder="Performance Bonus"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={24}>
                      <Col span={12}>
                        <Form.Item
                          label="Relocation"
                          name={[field.name, "relocation"]}
                        >
                          <Input type="number" placeholder="Relocation" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Bond Amount"
                          name={[field.name, "bondAmount"]}
                        >
                          <Input type="number" placeholder="Bond Amount" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={24}>
                      <Col span={12}>
                        <Form.Item
                          label="ESOP Amount"
                          name={[field.name, "esopAmount"]}
                        >
                          <Input type="number" placeholder="ESOP Amount" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="ESOP Vest Period"
                          name={[field.name, "esopVestPeriod"]}
                        >
                          <Input placeholder="ESOP Vest Period" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={24}>
                      <Col span={12}>
                        <Form.Item
                          label="First Year CTC"
                          name={[field.name, "firstYearCTC"]}
                        >
                          <Input type="number" placeholder="First Year CTC" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Retention Bonus"
                          name={[field.name, "retentionBonus"]}
                        >
                          <Input type="number" placeholder="Retention Bonus" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={24}>
                      <Col span={12}>
                        <Form.Item
                          label="Deductions"
                          name={[field.name, "deductions"]}
                        >
                          <Input type="number" placeholder="Deductions" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Medical Allowance"
                          name={[field.name, "medicalAllowance"]}
                        >
                          <Input
                            type="number"
                            placeholder="Medical Allowance"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={24}>
                      <Col span={12}>
                        <Form.Item
                          label="Bond Duration"
                          name={[field.name, "bondDuration"]}
                        >
                          <Input placeholder="Bond Duration" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Foreign Currency CTC"
                          name={[field.name, "foreignCurrencyCTC"]}
                        >
                          <Input
                            type="number"
                            placeholder="Foreign Currency CTC"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={24}>
                      <Col span={12}>
                        <Form.Item
                          label="Foreign Currency Code"
                          name={[field.name, "foreignCurrencyCode"]}
                        >
                          <Input
                            placeholder="Foreign Currency Code"
                            maxLength={3}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                ) : (
                  <>
                    <h2 className="text-sm">Internship Details</h2>
                    <Row gutter={24}>
                      <Col span={12}>
                        <Form.Item
                          label="Stipend"
                          name={[field.name, "stipend"]}
                        >
                          <Input type="number" placeholder="Stipend" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Foreign Currency Stipend"
                          name={[field.name, "foreignCurrencyStipend"]}
                        >
                          <Input placeholder="Foreign Currency Stipend" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={24}>
                      <Col span={12}>
                        <Form.Item
                          label="Accommodation"
                          name={[field.name, "accommodation"]}
                        >
                          <Input type="number" placeholder="Accommodation" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Tentative CTC"
                          name={[field.name, "tentativeCTC"]}
                        >
                          <Input type="number" placeholder="Tentative CTC" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item
                      label="PPO Confirmation Date"
                      name={[field.name, "PPOConfirmationDate"]}
                    >
                      <Input type="date" />
                    </Form.Item>
                  </>
                )}
                <Form.Item
                  label="Other Compensatons"
                  name={[field.name, "otherCompensations"]}
                >
                  <TextArea rows={4} placeholder="Other Compensatons" />
                </Form.Item>
              </Card>
            ))}

            <Button type="dashed" onClick={() => add()} block>
              + Add Salary
            </Button>
          </div>
        )}
      </Form.List>
    </Form>
  );
};

export default JobDetails;
